import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendVerificationEmail } from "../sendVerificationEmail";

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn(function (this: unknown) {
    return { emails: { send: mockSend } };
  }),
}));

beforeEach(() => {
  mockSend.mockReset();
  process.env.RESEND_API_KEY = "test-key";
  process.env.SENDER_EMAIL = "noreply@headlinefights.com";
});

describe("sendVerificationEmail", () => {
  it("sends an email with the verification code in the subject", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg_1" }, error: null });

    await sendVerificationEmail("Alice", "alice@example.com", "987654");

    expect(mockSend).toHaveBeenCalledOnce();
    const [payload] = mockSend.mock.calls[0];
    expect(payload.subject).toBe("987654 is your secure verification code");
    expect(payload.to).toBe("alice@example.com");
    expect(payload.from).toBe("noreply@headlinefights.com");
    expect(payload.html).toContain("Hi Alice");
    expect(payload.html).toContain("987654");
  });

  it("throws when Resend returns an error", async () => {
    const resendError = new Error("Resend service unavailable");
    mockSend.mockResolvedValue({ data: null, error: resendError });

    await expect(sendVerificationEmail("Bob", "bob@example.com", "123456")).rejects.toThrow(
      "Resend service unavailable"
    );
  });
});
