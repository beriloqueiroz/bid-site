import { SendTask } from "@/lib/types/SendTask";
import { dateByDeliveryType } from "@/lib/util/rules";
import { randomInt } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { deliveryService } from "@/lib/deliverySystem/IDeliveryService"
import { loginImplementation } from "@/lib/login/implementations/enviroment";

export type ResponseSendTaskApi = {
  status: number
  error: string | null
  content?: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseSendTaskApi | null>
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
    recipient,
    deliveryType } = JSON.parse(req.body);

  try {
    const orderNumber = `${prefixCompany}-${randomInt(100000)}`;
    const data: SendTask = {
      address: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep} Brazil`,
      complement: complement,
      phone: phone,
      name: `${orderNumber} - ${recipient}`,
      value: "10.00",
      startDate: dateByDeliveryType(deliveryType, 1),
      endDate: dateByDeliveryType(deliveryType),
      reference: reference,

      description: "",
      email: "sender@bid.log.br",
      orderNumber: orderNumber,

      account: prefixCompany.toString()
    };
    const response = await deliveryService.sendTask(data);
    if (response?.error) {
      res.status(500).json({ status: 500, error: response.error.toString() });
      return;
    }
    res.status(200).json({ status: 200, error: null, content: orderNumber })
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 500, error: "Erro interno" });
  }
};

export default handler;