import { mkdir, writeFile } from "node:fs/promises";
import { companies } from "../src/data/companies.ts";

// 链接检查器：只校验公开 URL 的可达性，不代表职位仍在招。
// 详见 README“投递入口与数据核验”章节。

const TIMEOUT_MS = 10000;
const CONCURRENCY = 6;

const HEAD_BLOCKLIST = new Set([403, 404, 405, 410, 501]);

/**
 * 收集每家公司中需要校验的链接记录。
 * 扫描字段：websiteUrl / careerUrl / sourceLinks[] / applicationEntries[].url
 */
const linkRecords = companies.flatMap((company) => {
  const records = [];
  if (typeof company.websiteUrl === "string" && company.websiteUrl.trim()) {
    records.push({ companyId: company.id, companyName: company.name, field: "websiteUrl", url: company.websiteUrl.trim() });
  }
  if (typeof company.careerUrl === "string" && company.careerUrl.trim()) {
    records.push({ companyId: company.id, companyName: company.name, field: "careerUrl", url: company.careerUrl.trim() });
  }
  for (const url of company.sourceLinks ?? []) {
    if (typeof url === "string" && url.trim()) {
      records.push({ companyId: company.id, companyName: company.name, field: "sourceLinks", url: url.trim() });
    }
  }
  for (const entry of company.applicationEntries ?? []) {
    if (entry && typeof entry.url === "string" && entry.url.trim()) {
      records.push({
        companyId: company.id,
        companyName: company.name,
        field: `applicationEntries(${entry.type ?? "unknown"})`,
        url: entry.url.trim(),
      });
    }
  }
  return records;
});

// 同一 URL 可能被多家公司引用，去重后只校验一次，但保留任一来源用于报错定位。
const uniqueRecords = [
  ...new Map(linkRecords.map((record) => [record.url, record])).values(),
];

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers:
      method === "GET"
        ? {
            // 尽量不下载大正文：只取极少字节。
            Range: "bytes=0-1023",
            "User-Agent": "beijing-embodied-ai-job-radar-link-checker",
          }
        : {
            "User-Agent": "beijing-embodied-ai-job-radar-link-checker",
          },
  });
}

function classifyStatus(status) {
  if (status >= 200 && status < 300) return "OK";
  if (status >= 300 && status < 400) return "WARN"; // follow 后仍 3xx，重定向未收敛
  if (status === 401 || status === 403 || status === 429) {
    // 可能是 WAF / 反爬 / 登录墙 / 限流，浏览器侧不一定失效，谨慎判为 WARN。
    return "WARN";
  }
  if (status >= 500 && status < 600) return "WARN"; // 服务端错误，常为瞬时
  return "FAIL"; // 400/404/410/其它 4xx 视为死链
}

async function checkLink(record) {
  let response;
  try {
    response = await request(record.url, "HEAD");
    // HEAD 不被支持或被 WAF 拦截时，回退 GET。
    if (HEAD_BLOCKLIST.has(response.status)) {
      response = await request(record.url, "GET");
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    const message = error instanceof Error ? error.message : "Unknown network error";
    return {
      ...record,
      level: isTimeout ? "WARN" : "FAIL",
      status: isTimeout ? `timeout (${TIMEOUT_MS}ms)` : `network error: ${message}`,
    };
  } finally {
    // GET 回退时主动放弃正文，避免下载大文件。
  }

  const level = classifyStatus(response.status);
  // 尝试释放可能的正文连接。
  try {
    if (response.body && typeof response.body.cancel === "function") {
      response.body.cancel();
    }
  } catch {
    // 忽略释放异常。
  }

  return { ...record, level, status: response.status };
}

async function runWithConcurrency(records, workerCount) {
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < records.length) {
      const index = cursor;
      cursor += 1;
      // 单链接失败不影响其它链接。
      try {
        results[index] = await checkLink(records[index]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results[index] = {
          ...records[index],
          level: "FAIL",
          status: `checker crashed: ${message}`,
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workerCount, records.length) }, () => worker()),
  );

  return results;
}

// ---- 覆盖率统计（独立于链接可达性）----
const totalCompanies = companies.length;
const companiesWithWebsite = companies.filter((c) => c.websiteUrl?.trim()).length;
const companiesWithCareerOrEntry = companies.filter(
  (c) => c.careerUrl?.trim() || (c.applicationEntries ?? []).length > 0,
).length;
const companiesWithVerificationDate = companies.filter((c) => c.lastVerifiedAt?.trim()).length;

console.log("---- 覆盖率 ----");
console.log(`Total companies: ${totalCompanies}`);
console.log(`Companies with website URL: ${companiesWithWebsite}`);
console.log(`Companies with career/application entry: ${companiesWithCareerOrEntry}`);
console.log(`Companies with verification date: ${companiesWithVerificationDate}`);
console.log(`Links to check (unique): ${uniqueRecords.length}`);
console.log("");

if (uniqueRecords.length === 0) {
  // 10.1 零链接不得静默成功。
  console.error("No links found to check. (websiteUrl/careerUrl/sourceLinks/applicationEntries 全部为空)");
  process.exitCode = 1;
} else {
  const results = await runWithConcurrency(uniqueRecords, CONCURRENCY);

  results.forEach((result) => {
    console.log(
      `[${result.level}] ${result.status} ${result.url} (${result.companyName} ${result.field})`,
    );
  });

  const summary = results.reduce(
    (counts, result) => {
      counts.checked += 1;
      if (result.level === "OK") counts.ok += 1;
      else if (result.level === "WARN") counts.warn += 1;
      else counts.failed += 1;
      return counts;
    },
    { checked: 0, ok: 0, warn: 0, failed: 0 },
  );

  console.log("");
  console.log("---- 链接可达性 ----");
  console.log(`Links checked: ${summary.checked}`);
  console.log(`OK: ${summary.ok}`);
  console.log(`WARN: ${summary.warn}`);
  console.log(`FAIL: ${summary.failed}`);

  await mkdir("reports", { recursive: true });
  await writeFile("reports/link-check.json", JSON.stringify({
    checkedAt: new Date().toISOString(), totalCompanies, totalLinks: uniqueRecords.length,
    ok: summary.ok, warn: summary.warn, fail: summary.failed,
    results: results.map((result) => ({
      companyId: result.companyId, companyName: result.companyName, field: result.field,
      url: result.url, status: result.level, httpStatus: typeof result.status === "number" ? result.status : null,
      message: String(result.status),
    })),
  }, null, 2));

  // 仅 FAIL 影响退出码；WARN（反爬/限流/超时/瞬时5xx）不判死链，不阻断。
  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}
