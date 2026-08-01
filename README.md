# 北京具身智能公司与岗位雷达

面向自动化、机器人、AI、计算机、电子信息、工业工程等专业学生的机器人、具身智能、科研仪器与智能制造求职导航网站。网站同时覆盖研发、产品、技术服务、交付、质量、制造、供应链和技术市场方向。

## 上线与数据维护

推荐部署到 Vercel：构建命令为 `npm run build`，输出目录为 `dist`。`vercel.json` 已将 `/privacy`、`/terms` 与异常路径回退到单页应用，刷新分享链接不会白屏。

公司与招聘入口维护在 `src/data/companies.ts`，职业方向维护在 `src/data/jobRoles.ts`，公司—岗位关系只维护在 `src/data/companyRoleFits.ts`，共享技能及七个分组维护在 `src/data/skills.ts`。新增或更新公司时，补齐官方 `sourceLinks`、`verificationStatus`、`lastVerifiedAt` 和已核验的 `applicationEntries`。状态含义为：已公开核验（官方来源已确认）、部分核验（仅部分公开信息已确认）、待核验（尚未确认）。每次核验后更新 `lastVerifiedAt`；超过 30 天会提示复核，超过 90 天会提示重新核验。

提交前执行：

```bash
npm test
npm run build
npm run check:links
npm audit --omit=dev
```

`npm run check:links` 会生成未提交的 `reports/link-check.json`，供自动化读取。GitHub Actions 会在 push、PR 和每周一的链接巡检中运行相应检查。

本站目标不是伪造“实时招聘数据库”，而是提供一个可维护、可搜索、可筛选的公司与岗位雷达，帮助学生快速判断哪些公司、岗位方向和技能组合值得优先准备。

## 如何启动

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

运行筛选和排序测试：

```bash
npm test
```

## 如何新增公司

公司数据在 `src/data/companies.ts`。

新增公司时按 `src/types.ts` 的 `Company` 类型补齐字段。若无法确认官网或招聘页，不要编造链接，可以留空，并把 `verificationStatus` 标记为 `待核验`。

建议新增时至少确认：

- 公司名称和英文名
- 北京相关性
- 核心方向
- 公司核心技能（不要从岗位技能自动生成）
- 推荐理由
- 风险与注意点
- 简历项目建议
- 公开搜索入口
- 已核验的公开来源链接 `sourceLinks`
- 最后人工核验日期 `lastVerifiedAt`，格式为 `YYYY-MM-DD`
- 具体投递入口 `applicationEntries`（仅填写已核验的官方入口，类型为 `career` / `campus` / `internship` / `experienced` / `other`）

## 如何新增岗位方向

岗位方向在 `src/data/jobRoles.ts`。

新增岗位时按 `JobRole` 类型填写：

- 主职能分类 `functionType`
- 快速筛选轨道 `track`
- 方向类型 `roleKind`（正式职业方向或宽口径校招入口）
- 常见标题和主要职责
- 适合专业、适合人群、自动化专业视角和典型挑战
- 必备技能、加分技能和建议项目
- 五项岗位画像评分
- 高重叠岗位的工作阶段、核心产出和责任边界
- 可参考的转型方向

公司关联统一维护在 `src/data/companyRoleFits.ts`。每条关系必须使用现有公司和岗位 ID，标明 `core`、`adjacent` 或 `possible`，并填写判断原因。关联只表示业务方向适配，不代表该公司当前存在对应招聘职位。

## 岗位方向说明

本站展示的是职业方向，不是实时招聘职位，也不统计某家公司当前开放的岗位数量。

- 公司与职业方向的关联表示业务类型和能力需求可能适配，不代表当前招聘。
- 岗位职责、出差强度和能力要求会因公司、团队、客户和项目阶段而异。
- 应届生友好度等岗位画像是 1～5 级的方向比较，不是权威职业测评或录用概率。
- 用户应前往公司官方招聘页确认职位名称、工作地点、招聘批次和实际要求。

当前职能体系：

- 研发与算法
- 产品与解决方案
- 技术服务
- 项目与交付
- 测试与质量
- 制造与供应链
- 销售与市场
- 运营与支持

岗位页支持按研发技术岗、技术非研发岗、商业与运营岗快速筛选，也支持按职能、具体方向、关键词和共享技能筛选。PM、SE、AE 会先提示消歧，FAE、FSE、NPI、SQE、CQE、PMM、CSM、SLAM、VLA 使用精确映射。

页面提供五问快速选岗和最多五个候选方向的移动端卡片对比。候选、岗位筛选和快速选岗偏好使用 URL Query 保存，刷新、分享及浏览器前进后退都能恢复；展开状态等临时界面状态不写入 URL。

## 数据来源和核验说明

当前版本使用人工维护的本地 TypeScript 数据文件，不接入爬虫、自动投递或招聘平台登录。

重要假设：

- 初始数据以公开常识、公司名称、方向标签和用户给定公司清单为基础整理。
- 已对部分高优先级公司人工核验了官方招聘入口、官网与公开来源，并在 `verificationStatus` 标记为 `部分核验`，同时填写 `sourceLinks`、`lastVerifiedAt` 与（如确认到）`applicationEntries`。
- 仍未核验的公司保持 `待核验`，不会自动编造官网、招聘页或投递入口。
- 不确定的官网和招聘页不会硬编，未核验公司优先提供公开搜索入口。
- 没有真实核验过的公司，不填写 `sourceLinks`、`lastVerifiedAt` 和 `applicationEntries`。
- 岗位是否有效，以公司官网、官方公众号和招聘平台为准。

## 投递入口与数据核验

本项目的投递入口（`websiteUrl` / `careerUrl` / `applicationEntries`）遵循以下边界：

1. 投递入口优先采用公司官方来源：官方招聘网站、官网招聘栏目、官方校招 / 社招 / 实习页，或经确认归属该公司的官方 ATS（如飞书招聘、hotjob、Workday 等）。
2. 并非所有公司均已核验。`verificationStatus` 为 `待核验` 的公司不展示编造的投递链接。
3. 未核验公司不会自动生成链接，仅保留公开搜索入口，避免误导投递。
4. 招聘页面会随招聘季与组织调整变化，链接可能随时失效或迁移。
5. 用户在投递前应再次确认职位是否在招、用人主体是否与目标公司一致。
6. 本项目是求职导航，不代替官方招聘信息；最终以官方渠道公告为准。
7. 不保证第三方招聘平台（BOSS 直聘、猎聘、智联、脉脉等）上该公司页面的状态，默认不将其作为官方主入口。
8. 链接检查（`npm run check:links`）只验证公开 URL 的可达性，可达 ≠ 职位仍开放，也不代表岗位与所述方向一致。

## 链接检查

运行：

```bash
npm run check:links
```

脚本会扫描每家公司的 `websiteUrl`、`careerUrl`、`sourceLinks[]`、`applicationEntries[].url`，输出覆盖率与可达性结果（`OK` / `WARN` / `FAIL`）。

行为说明：

- 当没有任何链接可检查时，脚本会明确报错并以非 0 退出码结束，不会静默“成功”。
- 使用 `HEAD` 请求优先，对不支持 `HEAD` 的端点回退 `GET`（带 `Range` 头，尽量不下载大正文）。
- 支持重定向跟随、请求超时、有限并发，单条链接失败不会中断整体检查。
- `401/403/429` 与 `5xx`、超时归为 `WARN`（可能是反爬、登录墙、限流或瞬时错误，浏览器侧不一定失效）；`400/404/410` 等归为 `FAIL`。
- 只有 `FAIL` 会以非 0 退出码结束；`WARN` 不判死链，避免因反爬或网络波动误报。

## 后续如何接入 GitHub Actions 定时更新

可以新增一个 `scripts/update-public-links.ts`，只做公开链接检查和状态更新，不绕过登录和反爬机制。

推荐流程：

1. 手动维护公司官网、招聘页、公众号文章或招聘平台公开搜索入口。
2. GitHub Actions 每周运行一次脚本。
3. 脚本只检查链接是否可访问、是否跳转、是否失效。
4. 生成变更 PR，由人工确认后合并。

示例方向：

```yaml
name: Check public career links
on:
  schedule:
    - cron: "0 2 * * 1"
  workflow_dispatch:
jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm install
      - run: npm run build
```

## 后续如何改成真实后端数据库

当前数据结构已经拆成 `Company` 和 `JobRole`，后续可以平滑迁移：

1. 先把 `companies.ts` 和 `jobRoles.ts` 导出为 JSON。
2. 建立数据库表：`companies`、`job_roles`、`skills`、`company_roles`、`company_skills`。
3. 前端把本地 import 改为 API 请求。
4. 后台增加人工审核字段，比如 `verificationStatus`、`lastVerifiedAt`、`sourceLinks`。
5. 保留当前筛选排序逻辑，先在前端跑；数据量变大后再迁移到后端查询。

## 免责声明

- 本站是求职导航，不保证岗位实时有效。
- 具体招聘信息以公司官网、官方公众号和招聘平台为准。
- 本站不绕过任何招聘平台的登录和反爬机制。
- “实时更新”以公开链接、搜索入口和人工维护数据为主。
- 公司数据中标记“待核验”的内容需要人工进一步确认。
- 链接检查只验证公开 URL 是否可达，不代表对应职位仍在开放，也不代表内容与所述方向一致。
