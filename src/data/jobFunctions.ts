import type { JobFunction, JobTrack } from "../types";

export const jobFunctionLabels: Record<JobFunction, string> = {
  "research-development": "研发与算法",
  "product-solution": "产品与解决方案",
  "technical-service": "技术服务",
  "delivery-project": "项目与交付",
  "testing-quality": "测试与质量",
  "manufacturing-supply": "制造与供应链",
  "sales-market": "销售与市场",
  "operations-support": "运营与支持",
};

export const jobTrackLabels: Record<JobTrack, string> = {
  rd: "研发技术岗",
  "technical-non-rd": "技术非研发岗",
  "business-operations": "商业与运营岗",
};

export const jobFunctions = Object.keys(jobFunctionLabels) as JobFunction[];
export const jobTracks = Object.keys(jobTrackLabels) as JobTrack[];
