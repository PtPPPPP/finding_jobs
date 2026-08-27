import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 部署在博客的 /finding-jobs/ 子路径下（随 PtP 静态导出同步到 out/finding-jobs）。
  base: "/finding-jobs/",
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        // 项目根会被外部工具（浏览器审计脚本等）动态写入各种以 "." 开头的隐藏目录，
        // 如 .chrome-audit-profile、.edge-roles-current 等 Chromium 用户数据目录，名字不固定。
        // 其中 Cookies 等文件被浏览器进程锁定，fs.watch 会触发 EBUSY，未捕获时会直接让
        // dev server 崩溃。统一忽略所有点开头的目录即可一劳永逸——源码在 src/ 下，HMR 不受影响。
        /(^|[/\\])\.[^/\\]+([/\\]|$)/,
        "**/node_modules/**",
        "**/dist/**",
        "**/playwright-report/**",
        "**/test-results/**",
        "**/coverage/**",
        "**/reports/**",
      ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
