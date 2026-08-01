const aliasMap: Record<string, string[]> = {
  rl: ["强化学习", "运动控制", "强化学习运控"],
  cv: ["计算机视觉", "视觉算法", "机器人视觉", "视觉感知", "OpenCV"],
  ros: ["ROS2", "ROS/ROS2"],
  slam: ["SLAM", "定位建图", "导航"],
  vla: ["VLA", "视觉语言动作", "具身智能"],
  "具身": ["具身", "具身智能", "具身大模型"],
  "机器人控制": ["机器人控制", "控制算法", "运动控制", "PID", "LQR", "MPC"],
  fae: ["FAE", "现场应用工程师", "应用工程师"],
  ae: ["应用工程师", "Application Engineer"],
  fse: ["售后服务工程师", "现场服务工程师", "Field Service Engineer"],
  se: ["解决方案工程师", "售前技术工程师", "销售工程师"],
  npi: ["NPI", "新产品导入", "工艺工程师"],
  qa: ["质量工程师", "质量保证"],
  sqe: ["供应商质量工程师", "供应商质量"],
  cqe: ["客户质量工程师", "客户质量"],
  bd: ["商务拓展", "生态合作"],
  pmm: ["产品市场", "技术市场", "Product Marketing"],
  csm: ["客户成功", "Customer Success"],
  pm: ["机器人产品经理", "技术项目经理"],
  "产品 pm": ["机器人产品经理"],
  "项目 pm": ["技术项目经理", "项目管理工程师"],
};

export function expandSearchTerms(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return [];

  const aliases = aliasMap[normalizedKeyword];
  return aliases
    ? aliases.map((term) => term.toLowerCase())
    : [normalizedKeyword];
}
