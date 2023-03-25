import nodemailer from 'nodemailer';
import { AttachmentsPath, IMailService, ResponseSent } from '../IMailService';

async function sendEmail(from:string, to:string, subject: string, body: string, attachmentsPaths?:AttachmentsPath[]): Promise<ResponseSent> {
  return new Promise((resolve) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: 'sender@bid.log.br',
        pass: 'Sender@bid#123',
      },
      logger: true,
    });

    const mailData = {
      from,
      to,
      subject,
      text: body,
      headers: { 'x-myheader': 'test header' },
      attachments: attachmentsPaths,
    };

    transporter.sendMail(mailData, (err) => {
      if (err) {
        resolve({ err });
      }
      resolve({});
    });
  });
}

export const IMailServiceNodeMailer: IMailService = { sendEmail };
