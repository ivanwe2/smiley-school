import { describe, it, expect } from "vitest";
import { escapeHtml, escapeHtmlWithBreaks } from "../html-escape";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("escapes a full XSS payload", () => {
    const result = escapeHtml('<img src=x onerror="alert(1)">');
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });
});

describe("escapeHtmlWithBreaks", () => {
  it("converts newlines to <br>", () => {
    expect(escapeHtmlWithBreaks("line1\nline2")).toBe("line1<br>line2");
  });

  it("escapes HTML before converting breaks", () => {
    expect(escapeHtmlWithBreaks("<script>\nalert")).toBe("&lt;script&gt;<br>alert");
  });

  it("handles multiple consecutive newlines", () => {
    expect(escapeHtmlWithBreaks("a\n\nb")).toBe("a<br><br>b");
  });
});
