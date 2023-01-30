import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import SubmitButton from "@/components/submitButton";
import axios from "axios";
import { useState } from "react";
import style from "../styles/rastreio.module.scss";
type Data = {
  status?: string;
  teste: string;
};
export default function Rastreio() {
  const [order, setOrder] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [response, setResponse] = useState<Data>({ teste: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    const response = await axios.get("/api/tracking?order=${order}", {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    console.log("Response received");
    if (response.status === 200) {
      setSubmitted(true);
      setResponse(response.data);
    } else {
      setError(true);
    }
    setSending(false);
  };

  return (
    <Layout simpleHeader={true}>
      <section className={style.section}>
        <form>
          <InputForm
            label='código de rastreio'
            type='text'
            name='order'
            id='order'
            placeholder='12365478'
            isRequired={true}
            setOnChange={setOrder}
            value={order}
          />
          <SubmitButton
            handleSubmit={handleSubmit}
            sending={sending}
            text='Buscar'
          />
          {!sending && error && (
            <span className={style.errorMessage}>
              Desculpe, Erro ao buscar, tente novamente ou entre em contato.
            </span>
          )}
          {submitted && !error && (
            <span className={style.successMessage}>
              Sucesso ao buscar informações.
            </span>
          )}
        </form>
        <div>{JSON.stringify(response)}</div>
      </section>
    </Layout>
  );
}
