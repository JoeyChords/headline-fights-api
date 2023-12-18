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

async function sendVerificationEmail(name, email, code) {
  let emailResponse = await transporter.sendMail({
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

  return emailResponse;
}

module.exports = sendVerificationEmail;
