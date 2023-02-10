import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: number
  error: string | null
  infos?: {
    rua: string,
    bairro: string,
    cidade: string,
    cep: string
  }
}

const getInfosByCEP = async (cep: string) => {
  const infos = {
    rua: "Rua Sousa Carvalho",
    bairro: "Bonsucesso",
    cidade: "Fortaleza",
    cep: cep
  }
  return infos
}
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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

  try {
    const infos = await getInfosByCEP("60541646");
    res.status(200).json({ status: 200, error: null, infos: infos })
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 500, error: "Erro interno" });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;