// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

type Data = {
  status: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: "sender@bid.log.br",
      pass: "Sender@bid#123",
    },
    logger: true
  });

  const body = req.body;

  const mailData = {
    from: `"Formulário (bid.log.br)" <sender@bid.log.br>`,
    to: "contato@bid.log.br",
    subject: "Contato pelo formulário do site",
    text: `${body.message}`,
    html: `<strong>${body.name}, ${body.phone} </strong>`,
    headers: { 'x-myheader': 'test header' }
  }

  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      console.log(err)
      res.status(500).json({ status: 'Nok' })
    }
    else {
      console.log(info)
      res.status(200).json({ status: 'Ok' })
    }
  })

}
