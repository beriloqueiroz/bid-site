import { sendTask } from "@/lib/deliforce/service";
import { SendTask } from "@/lib/types/SendTask";
import { randomInt } from "crypto";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

type Data = {
  status: number
  error: string | null
  orderNumber?: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
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

  if (process.env[prefixCompany.toString()] != passCompany) {
    res.status(401).json({ status: 401, error: "Credenciais inválidas" });
    return;
  }

  const generalAuth = process.env['CONFIG_' + prefixCompany] as string;
  const driver = process.env['DRIVER_' + prefixCompany] as string;
  const team = process.env['TEAM_' + prefixCompany] as string;
  const rule = process.env['RULE_' + prefixCompany] as string;

  if (!generalAuth || !rule || !driver || !team) return null;

  const keys = JSON.parse(generalAuth) as string[];

  const {
    street,
    number,
    neighborhood,
    city,
    state,
    cep,
    complement,
    reference,
    phone,
    recipient } = JSON.parse(req.body);
  try {
    const orderNumber = `${prefixCompany}-${randomInt(100000)}`;
    const startDate = moment()
    const data: SendTask = {
      address: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep} Brazil`,
      complement: complement,
      phone: phone,
      name: `${orderNumber} - ${recipient}`,
      value: "10.00",
      startDate: startDate.toString(),
      endDate: startDate.add(1, 'days').toString(),
      reference: reference,

      driverID: driver,
      ruleID: rule,
      teamID: team,

      description: prefixCompany.toString(),
      email: "sender@bid.log.br",
      orderNumber: orderNumber,

    };
    const key = keys[0]
    const response = await sendTask(data, key);
    if (response?.error) {
      res.status(500).json({ status: 500, error: response });
      return;
    }
    // sendEmail(req, res, prefixCompany.toString())
    res.status(200).json({ status: 200, error: null, orderNumber: orderNumber })
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 500, error: "Erro interno" });
  }
};

const sendEmail = (req: NextApiRequest,
  res: NextApiResponse<Data | null>, prefixCompany: string) => {
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
    from: `"Tabelas (bid.log.br)" <sender@bid.log.br>`,
    to: "tabelas@bid.log.br",
    subject: `${prefixCompany} - task inserida do site`,
    text: `${body.street},${body.number},${body.cep},${prefixCompany}`,
    headers: { 'x-myheader': 'test header' },
  }

  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      res.status(500).json({ status: 500, error: "Erro ao enviar e-mail" })
    }
    else {
      res.status(200).json({ status: 200, error: null })
    }
  })
}

export default handler;