const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // force IPv4, ignore any IPv6 addresses returned by DNS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendMail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
  });

  console.log("Message sent:", info.messageId);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
  console.log("Response:", info.response);

  return info;
};

module.exports = sendMail;