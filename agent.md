# AGENTS.md

## 项目名称

北京具身智能公司与岗位雷达网站
Beijing Embodied AI Company & Job Radar

## 项目目标

开发一个面向学生/求职者的具身智能求职信息网站，用于整理北京及北京有研发/招聘岗位的具身智能、机器人、人形机器人、灵巧手、机器人视觉、机器人控制、VLA/世界模型相关公司和岗位。

网站目标不是伪造“实时招聘数据库”，而是做一个可维护、可搜索、可持续更新的求职雷达系统。

核心用户是自动化、机器人、AI、计算机、电子信息等专业学生，尤其是希望找北京具身智能/机器人方向实习、校招、项目机会的人。

## 产品定位

这是一个“公司库 + 岗位库 + 技能匹配 + 投递入口”的轻量化求职网站。

用户打开网站后应该能快速完成三件事：

1. 看到北京具身智能公司从大到小/从强到弱的分层。
2. 根据自己的技能方向筛选适合投递的岗位。
3. 点击公司官网、招聘页、Boss/拉勾/猎聘/脉脉/公众号搜索入口继续投递。

## 技术栈要求

优先使用：

* React
* TypeScript
* Vite
* Tailwind CSS
* 本地 JSON/TS 数据文件作为数据源

暂时不要引入复杂后端、数据库、登录系统。

项目应该可以通过以下命令启动：

```bash
npm install
npm run dev
```

如果当前仓库已经有技术栈，则优先兼容现有技术栈，不要盲目重建项目。

## 页面结构

至少实现以下页面或模块：

### 1. 首页 Hero

展示网站名称、介绍、核心统计数据。

建议文案：

* 北京具身智能公司与岗位雷达
* 面向自动化/机器人/AI学生的求职导航
* 覆盖人形机器人、灵巧手、机器人视觉、运动控制、VLA、世界模型、SLAM、机器人测试与应用工程岗位

首页需要显示统计卡片：

* 公司数量
* 岗位方向数量
* S/A/B/C 梯队公司数量
* 最近更新时间

### 2. 公司雷达表

核心表格字段：

* 公司名称
* 英文名/品牌名
* 梯队：S / A / B / C
* 类型：人形机器人、灵巧手、工业机器人、服务机器人、大厂机器人团队、研究机构、具身大模型公司
* 北京相关性：北京总部 / 北京研发中心 / 北京岗位 / 北京创新平台
* 核心方向
* 适合学生岗位
* 推荐技能
* 适配度评分：1-5
* 投递优先级说明
* 官网/招聘页/搜索入口
* 数据更新时间

表格需要支持：

* 关键词搜索
* 按梯队筛选
* 按公司类型筛选
* 按岗位方向筛选
* 按技能关键词筛选
* 按适配度排序
* 按公司梯队排序

### 3. 岗位方向模块

展示适合学生投递的岗位类型。

至少包含：

* 机器人算法实习生
* 机器人控制算法工程师
* 运动控制/强化学习运控实习生
* ROS/ROS2开发实习生
* 仿真平台开发实习生
* 机器人测试工程师
* 机器人应用工程师
* 视觉算法实习生
* SLAM/导航算法实习生
* 机械臂/灵巧手算法实习生
* 具身智能数据采集/数据标注/数据闭环实习生
* VLA/多模态大模型实习生
* 产品/项目/解决方案实习生

每个岗位方向需要说明：

* 岗位职责
* 适合什么背景的学生
* 需要补哪些技能
* 简历项目应该怎么写
* 推荐投递公司

### 4. 技能匹配模块

用户可以根据自己掌握的技能筛选岗位。

技能标签至少包括：

* Python
* C++
* Linux
* ROS2
* Gazebo
* MuJoCo
* Isaac Sim
* PyTorch
* OpenCV
* YOLO
* 点云/PCL
* SLAM
* PID
* LQR
* MPC
* 强化学习
* 模仿学习
* VLA
* 多模态大模型
* 机械臂
* 移动机器人
* 嵌入式
* 传感器调试
* 机器人测试
* 技术文档

### 5. 公司详情卡片

点击公司后弹出或展开详情。

详情内容包括：

* 公司简介
* 方向标签
* 适合岗位
* 对本科生友好程度
* 推荐投递理由
* 风险/注意点
* 建议准备的项目
* 公开投递入口
* 实时搜索入口

### 6. 数据更新时间与免责声明

页面底部必须有说明：

* 本站是求职信息导航，不保证岗位实时有效。
* 岗位信息以公司官网、招聘平台、官方公众号为准。
* 不绕过任何招聘网站反爬机制。
* “实时更新”优先采用公开招聘页链接、搜索入口和手动维护数据。
* 后续可以接入公开 API、RSS、公司官网招聘页、GitHub Actions 定时更新。

## 初始公司数据

请至少内置以下公司/团队作为初始数据：

1. 银河通用 Galbot
2. 星海图 Galaxea AI
3. 星动纪元 ROBOTERA
4. 松延动力 Noetix Robotics
5. 加速进化 Booster Robotics
6. 北京人形机器人创新中心 / 天工
7. 灵心巧手 Linker Hand
8. 无界动力
9. 极佳视界 GigaAI
10. RoboScience 机器科学 / 机科未来
11. 中科慧灵 / 灵宝 CASBOT
12. 梅卡曼德 Mech-Mind
13. 珞石机器人 ROKAE
14. 遨博 AUBO
15. 猎户星空 OrionStar
16. 云迹科技
17. 小米机器人实验室
18. 美团机器人/无人机/机器人业务
19. 字节 Seed / 机器人与具身智能相关团队
20. 荣耀机器人/新产业孵化相关团队
21. 京东机器人业务
22. 百度智能云/机器人/大模型相关团队
23. 地平线
24. 经纬恒润
25. 维他动力 Vbot
26. 万境千寻
27. 吉翼具身智能机器人
28. 北京日冕机器人
29. 智源研究院 BAAI
30. 新拓尼克北京研发中心
31. 四川永星电子北京分公司具身智能相关团队

如果部分公司公开信息不足，不要编造融资、人数、岗位数量。可以标记为“需人工核验”。

## 数据结构建议

建议创建：

```txt
src/data/companies.ts
src/data/jobRoles.ts
src/data/skills.ts
src/types.ts
```

公司数据类型建议：

```ts
export type CompanyTier = "S" | "A" | "B" | "C";

export interface Company {
  id: string;
  name: string;
  englishName?: string;
  tier: CompanyTier;
  category: string[];
  beijingRelevance: "北京总部" | "北京研发中心" | "北京岗位" | "北京创新平台" | "待核验";
  focus: string[];
  suitableRoles: string[];
  recommendedSkills: string[];
  fitScore: number;
  undergraduateFriendlyScore: number;
  reason: string;
  risks?: string;
  projectSuggestion?: string;
  websiteUrl?: string;
  careerUrl?: string;
  searchUrl?: string;
  lastUpdated: string;
  verificationStatus: "已公开核验" | "部分核验" | "待核验";
}
```

岗位数据类型建议：

```ts
export interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  suitableFor: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeProjectIdeas: string[];
  recommendedCompanyIds: string[];
}
```

## UI 风格

视觉风格：科技感、深色模式优先，但要保持清晰可读。

建议风格：

* 背景：深色渐变
* 卡片：半透明玻璃拟态
* 重点色：蓝色、青色、紫色
* 标签：不同颜色区分 S/A/B/C 梯队
* 表格：支持移动端横向滚动
* 响应式：手机、平板、桌面都能看

不要做得太花哨。重点是信息密度、筛选效率和求职实用性。

## 代码质量要求

* 使用 TypeScript 类型约束
* 组件拆分清晰
* 不要把所有代码堆在 App.tsx
* 数据和视图分离
* 搜索和筛选逻辑单独封装
* 不要引入不必要的大型依赖
* 保证 npm run dev 可以正常启动
* 保证 npm run build 可以通过
* 页面不要出现控制台报错
* 所有外链使用 target="_blank" rel="noreferrer"

## 推荐组件拆分

```txt
src/components/Hero.tsx
src/components/StatsCards.tsx
src/components/FilterBar.tsx
src/components/CompanyTable.tsx
src/components/CompanyCard.tsx
src/components/JobRoleSection.tsx
src/components/SkillMatrix.tsx
src/components/FooterDisclaimer.tsx
src/utils/filterCompanies.ts
src/utils/sortCompanies.ts
```

## 不要做的事情

* 不要伪造真实岗位数量。
* 不要伪造公司融资金额、估值、员工数量。
* 不要绕过 Boss 直聘、猎聘、智联、脉脉等平台的登录或反爬机制。
* 不要写任何自动投递、批量打招呼、绕过平台规则的功能。
* 不要生成虚假的招聘信息。
* 不要把“待核验”信息写成确定事实。

## 后续可扩展功能

代码结构要方便后续加入：

* GitHub Actions 定时检查公开招聘页
* 公司数据后台编辑
* CSV/JSON 导入导出
* 收藏公司
* 投递状态管理
* 简历关键词匹配
* 岗位 JD 复制分析
* 公司地图分布
* RSS/公众号文章更新
* 求职进度看板

## 最终交付标准

完成后需要：

1. 网站可以正常启动。
2. 首页美观，有明确产品定位。
3. 公司表格可搜索、可筛选、可排序。
4. 至少有 30 家公司初始数据。
5. 至少有 10 个岗位方向说明。
6. 有技能匹配模块。
7. 有免责声明和数据更新时间。
8. 代码结构清晰，后续容易维护。
