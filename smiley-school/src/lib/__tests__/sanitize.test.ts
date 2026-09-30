import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    expect(sanitizeHtml("<script>alert(1)</script>")).toBe("");
  });

  it("strips event handler attributes", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("strips onclick handler", () => {
    const result = sanitizeHtml('<div onclick="alert(1)">text</div>');
    expect(result).not.toContain("onclick");
  });

  it("allows safe formatting tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("allows target attribute on links", () => {
    const input = '<a href="/foo" target="_blank">link</a>';
    expect(sanitizeHtml(input)).toContain('target="_blank"');
  });

  it("strips iframe tags", () => {
    const result = sanitizeHtml('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("iframe");
  });

  it("strips form tags", () => {
    const result = sanitizeHtml('<form action="/steal"><input></form>');
    expect(result).not.toContain("<form");
  });

  it("strips javascript: protocol in href", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("preserves nested safe HTML", () => {
    const input = "<div><h1>Title</h1><p>Paragraph with <em>emphasis</em></p></div>";
    expect(sanitizeHtml(input)).toBe(input);
  });
});
