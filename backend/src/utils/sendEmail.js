import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify Your Email",
    html: `
      <h3>Welcome!</h3>
      <p>Please verify your email by clicking below:</p>
      <a href="${url}" target="_blank">Verify Email</a>
    `,
  };

  await transporter.sendMail(message);
};
