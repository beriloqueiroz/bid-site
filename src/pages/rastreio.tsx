import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import SubmitButton from "@/components/submitButton";
import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import style from "../styles/rastreio.module.scss";
import moment from "moment";
import { useRouter } from "next/router";
import { FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import {
  MdNoteAdd,
  MdOutlineSmsFailed,
  MdOutlineGetApp,
  MdCancelPresentation,
} from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import { TfiReload } from "react-icons/tfi";
import { GoPackage } from "react-icons/go";
import { useParams } from "react-router-dom";

function ReactIcon({ status }: { status: string }): ReactElement {
  const st = [
    {
      out: <MdOutlineGetApp />,
      in: "Arquivo de transporte recebido",
    },
    {
      out: <GoPackage />,
      in: "Pacote coletado pelo Entregador",
    },
    {
      out: <FaMotorcycle />,
      in: "Pacote aceito pelo Entregador",
    },
    {
      out: <FaMotorcycle />,
      in: "Pacote em rota de entrega",
    },
    {
      out: <FaMotorcycle />,
      in: "O Entregador está próximo ao endereço de destino",
    },
    {
      out: <FaCheckCircle />,
      in: "Pacote entregue com sucesso",
    },
    {
      out: <MdOutlineSmsFailed />,
      in: "Falha na Entrega",
    },
    {
      out: <MdCancelPresentation />,
      in: "Entrega abortada",
    },
    {
      out: <MdCancelPresentation />,
      in: "Entrega cancelada",
    },
    {
      out: <RiImageAddFill />,
      in: "Protocolo de entrega adicionado",
    },
    {
      out: <TfiReload />,
      in: "Dados de entrega atualizados - Nova tentativa de entrega",
    },
    {
      out: <MdNoteAdd />,
      in: "Nota de entrega adicionada",
    },
  ].find((s) => s.in == status);
  return st?.out || <></>;
}

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
  reason: string;
  imageArry: string[];
  notes: string;
  taskDescStatus: string;
};
export default function Rastreio() {
  const [orderTrack, setOrder] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [isShowDetail, setShowDetail] = useState([""]);
  const [response, setResponse] = useState<TaskLog[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  var router = useRouter();

  useEffect(() => {
    const tracking = async (orderTrackApi: string) => {
      setSending(true);
      setError(false);
      setIsPrivate(!!router.query["private"]);
      const responseApi = await axios.get(
        `/api/tracking?order=${orderTrackApi}`,
        {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        }
      );
      if (responseApi.status === 200) {
        setSubmitted(true);
        setResponse(responseApi.data);
      } else {
        setError(true);
      }
      setSending(false);
    };
    if (!!router.query["order"]) {
      tracking(router.query["order"].toString());
    }
  }, [router.query]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (router.isReady) {
      router.push(
        {
          query: null
        },
        undefined,
        { shallow: true }
      );
    }
    setSending(true);
    setError(false);
    setIsPrivate(!!router.query["private"]);
    const responseApi = await axios.get(`/api/tracking?order=${orderTrack}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    if (responseApi.status === 200) {
      setSubmitted(true);
      setResponse(responseApi.data);
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
            value={orderTrack}
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
          submitted && <p className={style.warn}>Nenhum pacote encontrado</p>
        ) : (
          <div className={style.result}>
            <div className={style.generalOrderInfo}>
              <p>
                <strong>Descrição:</strong> {response.slice(-1).pop()?.name}
              </p>
              <p>
                <strong>Pedido:</strong> {response.slice(-1).pop()?.orderId}
              </p>
              <p>
                <strong>Endereço:</strong>{" "}
                {response.slice(-1).pop()?.address.formatted_address}
              </p>
            </div>
            <ul className={style.ul}>
              {response.map(
                (task, i) =>
                  task.taskStatus != "0" && (
                    <li key={task._id}>
                      <div className={style.init}>
                        <div className={style.icon}>
                          <ReactIcon status={task.taskDescStatus} />
                        </div>
                        <div className={style.status}>
                          <p>{`${task.taskDescStatus}`}</p>
                          <div className={style.statusInfo}>
                            <p>
                              {moment(task.created_at).format(
                                "DD/MM/YYYY hh:mm:ss"
                              )}
                            </p>
                            <p className={style.reason}>
                              {task.reason ? task.reason : ""}
                            </p>
                            {!isPrivate &&
                              (task.notes || task.imageArry?.length) && (
                                <p
                                  className={style.more_detail}
                                  onClick={() => showDetail(task._id)}>
                                  mais detalhes
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                      {isShowDetail.includes(task._id) &&
                        (task.notes || task.imageArry?.length) && (
                          <div className={style.detail}>
                            {task.notes && (
                              <p>
                                <strong>Notas:</strong> {task.notes}
                              </p>
                            )}
                            {task.imageArry?.length > 0 && (
                              <div>
                                <strong>Imagens:</strong>
                                {task.imageArry.map((img, i) => (
                                  <a
                                    className={style.imagem}
                                    key={i}
                                    href={img}
                                    target='_blank'
                                    rel='noopener noreferrer'>
                                    <img
                                      src={img}
                                      alt={`Imagem ${i + 1}`}
                                      width='50px'
                                      height='50px'
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </li>
                  )
              )}
            </ul>
          </div>
        )}
      </section>
    </Layout>
  );
}
