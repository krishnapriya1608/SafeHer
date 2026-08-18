const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;