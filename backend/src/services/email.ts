import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.password,
      },
    });
  }

  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const mailer = getTransporter();

  if (!mailer) {
    return { skipped: true };
  }

  await mailer.sendMail({
    from: env.smtp.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { skipped: false };
}