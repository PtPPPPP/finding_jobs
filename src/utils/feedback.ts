import type { Company } from "../types";

export function createFeedbackTemplate(company?: Pick<Company, "id" | "name">, pageUrl = window.location.href) {
  const subject = company ? `公司信息反馈：${company.name}` : "网站反馈";
  return [
    `主题：${subject}`,
    company ? `公司名称：${company.name}` : "反馈类型：新增公司 / 功能建议 / 其他",
    company ? `公司 ID：${company.id}` : "",
    "问题类型：失效链接 / 信息错误 / 招聘入口错误 / 公司已更名 / 新增公司 / 其他",
    `当前页面：${pageUrl}`,
    "问题说明：",
    "参考来源（如有）：",
  ].filter(Boolean).join("\n");
}
