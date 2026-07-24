import { describe, it, expect } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("allows a plain relative path", () => {
    expect(safeNextPath("/redefinir-senha")).toBe("/redefinir-senha");
  });

  it("defaults to / for null/undefined/empty", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("rejects absolute URLs to another origin", () => {
    expect(safeNextPath("https://evil.com/phishing")).toBe("/");
    expect(safeNextPath("http://evil.com")).toBe("/");
  });

  it("rejects protocol-relative URLs (//evil.com)", () => {
    expect(safeNextPath("//evil.com")).toBe("/");
  });

  it("rejects paths that don't start with a slash", () => {
    expect(safeNextPath("evil.com")).toBe("/");
  });

  it("rejects backslash tricks browsers may normalize into protocol-relative URLs", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/");
  });
});
