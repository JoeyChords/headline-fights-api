import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { User } from "../user";

describe("User model", () => {
  it("stores name, email, and password fields", () => {
    const doc = new User({ name: "Alice", email: "alice@example.com", password: "secret" });
    expect(doc.name).toBe("Alice");
    expect(doc.email).toBe("alice@example.com");
    expect(doc.password).toBe("secret");
  });

  it("stores optional fields", () => {
    const doc = new User({
      name: "Bob",
      email: "bob@example.com",
      password: "secret",
      email_verified: true,
      verification_code: 123456,
    });
    expect(doc.email_verified).toBe(true);
    expect(doc.verification_code).toBe(123456);
  });

  it("stores password_reset_token and password_reset_datetime", () => {
    const now = new Date();
    const doc = new User({
      name: "Carol",
      email: "carol@example.com",
      password: "secret",
      password_reset_token: "abc123",
      password_reset_datetime: now,
    });
    expect(doc.password_reset_token).toBe("abc123");
    expect(doc.password_reset_datetime).toEqual(now);
  });

  it("initializes headlines as an empty array", () => {
    const doc = new User({ name: "Dave", email: "dave@example.com", password: "secret" });
    expect(doc.headlines).toEqual([]);
  });

  it("stores headline entries", () => {
    const doc = new User({
      name: "Eve",
      email: "eve@example.com",
      password: "secret",
      headlines: [
        {
          headline_id: "abc",
          publication: "The Times",
          chose_correctly: true,
          attribute1: "sensationalism",
          attribute1Answer: "true",
          attribute2: "tonality_bias",
          attribute2Answer: "false",
        },
      ],
    });
    expect(doc.headlines).toHaveLength(1);
    expect(doc.headlines[0].chose_correctly).toBe(true);
  });

  describe("comparePassword", () => {
    it("returns true for a matching password", async () => {
      const hash = await bcrypt.hash("correctPassword", 10);
      const doc = new User({ name: "Test", email: "t@t.com", password: "placeholder" });
      const result = await doc.comparePassword("correctPassword", hash);
      expect(result).toBe(true);
    });

    it("returns false for a non-matching password", async () => {
      const hash = await bcrypt.hash("correctPassword", 10);
      const doc = new User({ name: "Test", email: "t@t.com", password: "placeholder" });
      const result = await doc.comparePassword("wrongPassword", hash);
      expect(result).toBe(false);
    });
  });
});
