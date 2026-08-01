import { describe, expect, it } from "vitest";
import { createFeedbackTemplate } from "./feedback";

describe("feedback template", () => {
  it("includes encoded-safe company context and page URL text", () => {
    const text = createFeedbackTemplate({ id: "a&b", name: "测试公司 & AI" }, "https://example.com/?q=a&b");
    expect(text).toContain("公司 ID：a&b");
    expect(text).toContain("https://example.com/?q=a&b");
  });
});
