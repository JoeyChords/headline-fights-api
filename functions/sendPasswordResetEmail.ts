import { Resend } from "resend";

export async function sendPasswordResetEmail(name: string, email: string, token: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const origin = process.env.ORIGIN ?? "https://www.headlinefights.com";
  const { error } = await resend.emails.send({
    from: process.env.SENDER_EMAIL_2 ?? "",
    to: email,
    subject: "Reset Your Password",
    html:
      "<p>Hi " +
      name +
      ",</p><p>Your secure password reset link for Headline Fights expires in 15 minutes.</p><strong>" +
      origin +
      "/resetPassword?email=" +
      email +
      "&token=" +
      token +
      "</strong><p>Don't share this link or forward this email to anyone else. If you didn't make this request, you can ignore this email.</p>",
  });

  if (error) {
    throw error;
  }
}
