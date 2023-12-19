const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});

async function sendPasswordResetEmail(name, email, token) {
  let emailResponse = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
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

  return emailResponse;
}

module.exports = sendPasswordResetEmail;
