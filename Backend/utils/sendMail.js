const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendMail = async ({ to, subject, html }) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { name: "SafeSphere", email: process.env.EMAIL_FROM },
      to: [{ email: to }],
    });

    console.log("Message sent:", result);
    return result;
  } catch (err) {
    console.error("Brevo error:", err.message, err.statusCode || "");
    throw new Error(err.message || "Failed to send email");
  }
};

module.exports = sendMail;