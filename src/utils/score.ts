// 五分制评分的统一渲染（●○ 圆点样式），供公司卡片与岗位画像列表共用
export const renderScoreDots = (score: number) => `${"●".repeat(score)}${"○".repeat(5 - score)}`;
