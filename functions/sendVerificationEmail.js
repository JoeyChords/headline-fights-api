const { Resend } = require("resend");
require("dotenv").config();

async function sendVerificationEmail(name, email, code) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: code + " is your secure verification code",
    html:
      "<p>Hi " +
      name +
      ",</p><p>Your secure verification code for Headline Fights expires in 15 minutes.</p><strong>" +
      code +
      "</strong><p>Don't share this code or forward this email to anyone else. If you didn't make this request, you can ignore this email.</p>",
  });

  if (error) {
    throw error;
  }

  return data;
}

module.exports = sendVerificationEmail;
