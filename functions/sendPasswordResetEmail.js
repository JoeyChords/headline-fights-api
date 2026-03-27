const { Resend } = require("resend");
require("dotenv").config();

async function sendPasswordResetEmail(name, email, token) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.SENDER_EMAIL_2,
    to: email,
    subject: "Reset Your Password",
    html:
      "<p>Hi " +
      name +
      ",</p><p>Your secure password reset link for Headline Fights expires in 15 minutes.</p><strong>" +
      "https://www.headlinefights.com/resetPassword?email=" +
      email +
      "&token=" +
      token +
      "</strong><p>Don't share this link or forward this email to anyone else. If you didn't make this request, you can ignore this email.</p>",
  });

  if (error) {
    throw error;
  }

  return data;
}

module.exports = sendPasswordResetEmail;
