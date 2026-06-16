import { describe, it, expect } from "vitest";

describe("api module", () => {
  it("has fetchContexts defined as a function", async () => {
    const { fetchContexts } = await import("../utils/api");
    expect(typeof fetchContexts).toBe("function");
  });

  it("has fetchNamespaces defined as a function", async () => {
    const { fetchNamespaces } = await import("../utils/api");
    expect(typeof fetchNamespaces).toBe("function");
  });

  it("has fetchPods defined as a function", async () => {
    const { fetchPods } = await import("../utils/api");
    expect(typeof fetchPods).toBe("function");
  });

  it("has fetchFiles defined as a function", async () => {
    const { fetchFiles } = await import("../utils/api");
    expect(typeof fetchFiles).toBe("function");
  });

  it("has saveAndDownload defined as a function", async () => {
    const { saveAndDownload } = await import("../utils/api");
    expect(typeof saveAndDownload).toBe("function");
  });
});
