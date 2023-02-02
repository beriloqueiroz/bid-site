import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../lib/parse-form";
import nodemailer from "nodemailer";


type Data = {
  status: string
  error: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      status: "Nok",
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
  try {
    const { fields, files } = await parseForm(req);

    const file = files.media;
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
    let name = Array.isArray(file) ? file.map((f) => f.newFilename) : file.newFilename;

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

    const mailData = {
      from: `"Tabelas (bid.log.br)" <sender@bid.log.br>`,
      to: "tabelas@bid.log.br",
      subject: "Tabela pelo formulário do site",
      text: `Em anexo`,
      headers: { 'x-myheader': 'test header' },
      attachments: [
        {
          filename: name.toString(),
          path: url.toString()
        }
      ]
    }

    transporter.sendMail(mailData, function (err, info) {
      if (err) {
        res.status(500).json({ status: 'Nok', error: "" })
      }
      else {
        res.status(200).json({ status: 'Ok', error: "" })
      }
    })
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ status: "Nok", error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ status: "Nok", error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;