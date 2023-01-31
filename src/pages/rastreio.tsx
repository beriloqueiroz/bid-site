import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import SubmitButton from "@/components/submitButton";
import axios from "axios";
import { useState } from "react";
import style from "../styles/rastreio.module.scss";
import moment from "moment";
type TaskLog = {
  _id: string;
  role: number;
  taskStatus: string;
  taskId: string;
  clientId: string;
  driverName: string;
  user: string;
  distanceTravelled: number;
  created_at: string;
  name: string;
  date: string;
  endDate: string;
  orderId: string;
  address: {
    formatted_address: string;
  };
};
export default function Rastreio() {
  const [order, setOrder] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [isShowDetail, setShowDetail] = useState([""]);
  const [response, setResponse] = useState<TaskLog[]>([]);

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

  function showDetail(value: string) {
    if (isShowDetail.includes(value)) {
      setShowDetail(isShowDetail.filter((id) => id != value));
    } else setShowDetail([...isShowDetail, value]);
  }

  return (
    <Layout simpleHeader={true}>
      <section className={style.section}>
        <form>
          <InputForm
            label='código de rastreio'
            type='text'
            name='order'
            id='order'
            placeholder='PREFX-12365478'
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
        {response.length <= 0 ? (
          <p className={style.warn}>Nenhum pacote encontrado</p>
        ) : (
          <ul className={style.ul}>
            {response.map((task) => (
              <li key={task._id}>
                <div className={style.init}>
                  <div className={style.icon}>
                    <svg
                      fill='#000000'
                      height='30px'
                      width='30px'
                      version='1.2'
                      baseProfile='tiny'
                      id='Layer_1'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='-479 281 256 256'>
                      <path
                        d='M-382.7,326.9c2.9,7.6,10.2,13.1,18.8,13.1c11.1,0,20.1-9,20.1-20.1c0-2.6-0.5-5.1-1.4-7.3h7l0,0
	c-3.1-12.1-14.2-21.1-27.3-21.1c-15.6,0-28.3,12.6-28.3,28.2c0,2.6,0.3,5,1,7.4h10.1V326.9z M-308.2,412.6l-42.5,12.2v61.4
	c4.6,0,8.7-2.3,11.7-5.3l41.4-47.3L-308.2,412.6z M-364.9,385.4c2.2,3.5,5.1,4.8,7.8,4.7l28-0.1c11.4,0,11.4-14.8,0-14.8h-22.7
	l-22.8-34.9c-2.8-3.1-6.8-5.1-11.4-5.1c-4.8,0-9.2,2.2-11.9,5.7l-33.7,51.5c-1.4,2.3-2.2,5-2.2,7.8c0,5.3,2.7,9.9,6.8,12.7
	l45.2,25.1v42.7c0,6.1,4.9,11,10.9,11s10.9-4.9,10.9-11v-53.3c0,0,1.4-8.5-8.2-13.1l-28.2-14.7l20.5-31.4L-364.9,385.4z
	 M-266.9,411.1c5.6,0,8.7,1.3,13.5,3.4c0.3,0.1,0.5,0.1,0.9,0.1c1.3,0,2.5-1.1,2.5-2.5c0-0.7-0.3-1.3-0.7-1.7
	c-5.5-5.2-9.9-6.9-18.3-6.9c-5.2,0-10.3,1.6-16.4,3.5l4.9,9.7C-275.2,412.4-270.6,411.1-266.9,411.1z M-438.7,417.9
	c-6.7-3.5-12-4-16.2-4c-8.4,0-14,1.7-19.5,6.9c-0.4,0.4-0.7,1-0.7,1.7c0,1.3,1.1,2.5,2.5,2.5c0.3,0,0.6,0,0.9-0.1
	c4.8-2.1,7.9-3.4,13.5-3.4c3.7,0,9,1.2,12.9,3.2l54.2,29.8l-0.1-10.5L-438.7,417.9z M-434.3,445.7c-22.3,0-40.4,18.1-40.4,40.4
	c0,22.3,18.1,40.4,40.4,40.4c22.3,0,40.4-18.1,40.4-40.4C-393.9,463.8-412,445.7-434.3,445.7z M-434.3,514.2c-15.5,0-28-12.5-28-28
	s12.5-28,28-28s28,12.5,28,28C-406.3,501.6-418.9,514.2-434.3,514.2z M-267.3,445.7c-22.3,0-40.3,18.1-40.3,40.4
	c0,22.3,18,40.4,40.3,40.4s40.4-18.1,40.4-40.4S-245,445.7-267.3,445.7z M-267.3,514.2c-15.4,0-27.9-12.5-27.9-28s12.5-28,27.9-28
	c15.5,0,28,12.5,28,28C-239.3,501.6-251.8,514.2-267.3,514.2z M-326.5,397.4c0,2.5,2,4.5,4.5,4.5l12.8-0.1c2.2,0,4.6,1.5,5.5,3.6
	l18.5,37.7l9-3.1l-19.6-39.2c-2.6-4.7-7.6-7.9-13.3-7.9h-12.8C-324.5,392.8-326.5,394.9-326.5,397.4z'
                      />
                    </svg>
                  </div>
                  <div className={style.status}>
                    <p>{`${task.taskStatus} pelo ${task.driverName}`}</p>
                    <div className={style.statusInfo}>
                      <p>
                        {moment(task.created_at).format("DD/MM/YYYY hh:mm:ss")}
                      </p>
                      <span onClick={() => showDetail(task._id)}>detalhes</span>
                    </div>
                  </div>
                </div>
                {isShowDetail.includes(task._id) && (
                  <div className={style.detail}>
                    <p>
                      <strong>Descrição:</strong> {task.name}
                    </p>
                    {/* <p>
                      <strong>Data inicial:</strong>{" "}
                      {moment(task.date).format("DD/MM/YYYY hh:mm:ss")}
                    </p>
                    <p>
                      <strong>Data final:</strong>{" "}
                      {moment(task.endDate).format("DD/MM/YYYY hh:mm:ss")}
                    </p> */}
                    <p>
                      <strong>Pedido:</strong> {task.orderId}
                    </p>
                    <p>
                      <strong>Endereço:</strong>{" "}
                      {task.address.formatted_address}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
