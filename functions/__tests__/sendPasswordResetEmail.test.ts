import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendPasswordResetEmail } from "../sendPasswordResetEmail";

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn(function (this: unknown) {
    return { emails: { send: mockSend } };
  }),
}));

beforeEach(() => {
  mockSend.mockReset();
  process.env.RESEND_API_KEY = "test-key";
  process.env.SENDER_EMAIL_2 = "reset@headlinefights.com";
  delete process.env.ORIGIN;
});

describe("sendPasswordResetEmail", () => {
  it("sends a reset email to the correct address", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg_1" }, error: null });

    await sendPasswordResetEmail("Alice", "alice@example.com", "tok123");

    expect(mockSend).toHaveBeenCalledOnce();
    const [payload] = mockSend.mock.calls[0];
    expect(payload.to).toBe("alice@example.com");
    expect(payload.subject).toBe("Reset Your Password");
    expect(payload.html).toContain("Hi Alice");
    expect(payload.html).toContain("alice@example.com");
    expect(payload.html).toContain("tok123");
  });

  it("uses ORIGIN env var when set", async () => {
    process.env.ORIGIN = "https://staging.headlinefights.com";
    mockSend.mockResolvedValue({ data: { id: "msg_2" }, error: null });

    await sendPasswordResetEmail("Bob", "bob@example.com", "tok456");

    const [payload] = mockSend.mock.calls[0];
    expect(payload.html).toContain("https://staging.headlinefights.com/resetPassword");
  });

  it("falls back to production URL when ORIGIN is not set", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg_3" }, error: null });

    await sendPasswordResetEmail("Carol", "carol@example.com", "tok789");

    const [payload] = mockSend.mock.calls[0];
    expect(payload.html).toContain("https://www.headlinefights.com/resetPassword");
  });

  it("throws when Resend returns an error", async () => {
    const resendError = new Error("Resend unavailable");
    mockSend.mockResolvedValue({ data: null, error: resendError });

    await expect(sendPasswordResetEmail("Dave", "dave@example.com", "tok000")).rejects.toThrow("Resend unavailable");
  });
});
