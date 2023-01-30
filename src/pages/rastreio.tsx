import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import SubmitButton from "@/components/submitButton";
import axios from "axios";
import { useState } from "react";
import style from "../styles/rastreio.module.scss";
import moment from "moment";
type OrderDTO = {
  name: string;
  date: string;
  endDate: string;
  orderId: string;
  taskStatus: number;
  address: {
    formatted_address: string;
  };
};
export default function Rastreio() {
  const [order, setOrder] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [response, setResponse] = useState<OrderDTO[]>([]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    const response = await axios.get(`/api/tracking?order=${order}`, {
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
        {response.length <= 0 ? null : (
          <ul className={style.ul}>
            {response.map((order) => (
              <li key={order.orderId}>
                <p>
                  <strong>Descrição:</strong> {order.name}
                </p>
                <p>
                  <strong>Data inicial:</strong>{" "}
                  {moment(order.date).format("DD/MM/YYYY hh:mm:ss")}
                </p>
                <p>
                  <strong>Data final:</strong>{" "}
                  {moment(order.endDate).format("DD/MM/YYYY hh:mm:ss")}
                </p>
                <p>
                  <strong>Pedido:</strong> {order.orderId}
                </p>
                <p>
                  <strong>Endereço:</strong> {order.address.formatted_address}
                </p>
                <span>
                  <strong>Status:</strong> {order.taskStatus}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
