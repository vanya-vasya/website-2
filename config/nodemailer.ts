import nodemailer from "nodemailer";

const email = process.env.OUTBOX_EMAIL;
const pass = process.env.OUTBOX_EMAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass,
  },
});

export const mailOptions = {
  from: email,
  to: process.env.INBOX_EMAIL
};