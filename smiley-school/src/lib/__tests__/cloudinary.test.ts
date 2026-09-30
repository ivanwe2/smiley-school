import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: {
      api_sign_request: vi.fn().mockReturnValue("mock_signature"),
    },
  },
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "test-cloud");
  vi.stubEnv("CLOUDINARY_API_KEY", "test-key");
  vi.stubEnv("CLOUDINARY_API_SECRET", "test-secret");
});

describe("getCloudinaryUrl", () => {
  let getCloudinaryUrl: (id: string, opts?: any) => string;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../cloudinary");
    getCloudinaryUrl = mod.getCloudinaryUrl;
  });

  it("preserves dots in filenames", () => {
    const url = getCloudinaryUrl("gallery/photo.profile.jpg");
    expect(url).toContain("photo.profile.jpg");
  });

  it("strips path traversal sequences", () => {
    const url = getCloudinaryUrl("../../etc/passwd");
    expect(url).not.toContain("..");
  });

  it("collapses multiple slashes", () => {
    const url = getCloudinaryUrl("gallery//sub//file.jpg");
    expect(url).toContain("gallery/sub/file.jpg");
  });

  it("strips leading slash", () => {
    const url = getCloudinaryUrl("/leading/slash.jpg");
    expect(url).not.toMatch(/\/image\/upload\/f_\//);
  });

  it("includes transform parameters", () => {
    const url = getCloudinaryUrl("photo.jpg", { width: 800, height: 600 });
    expect(url).toContain("w_800");
    expect(url).toContain("h_600");
  });
});

describe("generateUploadSignature", () => {
  let generateUploadSignature: (folder: string, timestamp: number) => any;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../cloudinary");
    generateUploadSignature = mod.generateUploadSignature;
  });

  it("includes allowedFormats in response", () => {
    const result = generateUploadSignature("smiley-school", Date.now());
    expect(result.allowedFormats).toContain("jpg");
    expect(result.allowedFormats).toContain("png");
  });

  it("includes maxFileSize in response", () => {
    const result = generateUploadSignature("smiley-school", Date.now());
    expect(result.maxFileSize).toBe(10 * 1024 * 1024);
  });

  it("signs with format and size constraints", async () => {
    generateUploadSignature("smiley-school", 1234567890);

    const cloudinary = await import("cloudinary");
    const callArgs = (cloudinary.v2.utils.api_sign_request as any).mock.calls[0];
    expect(callArgs[0].allowed_formats).toBe("jpg,jpeg,png,webp,gif");
    expect(callArgs[0].max_file_size).toBe("10485760");
  });
});
