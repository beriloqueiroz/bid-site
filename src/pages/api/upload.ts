import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../lib/util/parse-form";
import nodemailer from "nodemailer";
import { loginImplementation } from "@/lib/login/implementations/enviroment";

export type ResponseUploadApi = {
  status: number
  error: string | null
  content?: any
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseUploadApi | null>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      status: 405,
      error: "Method Not Allowed",
    });
    return;
  }

  const prefixCompany = req.headers["x-company"];
  const passCompany = req.headers["x-authentication"]

  if (!prefixCompany || !passCompany) {
    res.status(401).json({ status: 401, error: "Credenciais inválidas" });
    return;
  }

  const token = await loginImplementation.login(prefixCompany.toString(), passCompany.toString());

  if (token != "12365478") {
    res.status(401).json({ status: 401, error: "Credenciais inválidas" });
    return;
  }


  try {
    const { files } = await parseForm(req);

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
      subject: `${prefixCompany} - Tabela pelo formulário do site`,
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
        res.status(500).json({ status: 500, error: "Erro ao enviar e-mail" })
      }
      else {
        res.status(200).json({ status: 200, error: null })
      }
    })
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ status: 400, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ status: 500, error: "Erro interno" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;