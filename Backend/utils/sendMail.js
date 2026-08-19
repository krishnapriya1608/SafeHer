const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.EMAIL_PASSWORD);

const sendMail = async ({ to, subject, html }) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = { email: process.env.EMAIL, name: "SafeSphere" };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Message sent:", data.body?.messageId || data);
    return data;
  } catch (err) {
    console.error("Brevo error:", err.response?.body || err.message);
    throw new Error(err.response?.body?.message || "Failed to send email");
  }
};

module.exports = sendMail;