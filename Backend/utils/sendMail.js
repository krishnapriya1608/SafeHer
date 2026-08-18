// utils/sendMail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.EMAIL_PASSWORD);

const sendMail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL, 
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("Message sent:", data.id);
  return data;
};

module.exports = sendMail;