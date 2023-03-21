/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-underscore-dangle */
import { ReactElement, useEffect, useState } from 'react';
import { FaMotorcycle, FaCheckCircle } from 'react-icons/fa';
import { GoPackage } from 'react-icons/go';
import {
  MdNoteAdd, MdOutlineSmsFailed, MdOutlineGetApp, MdCancelPresentation,
} from 'react-icons/md';
import { RiImageAddFill } from 'react-icons/ri';
import { TfiReload } from 'react-icons/tfi';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import Layout from '@/components/layout';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import { TaskStatus } from '@/lib/types/TaskStatus';
import axios from 'axios';
import { useRouter } from 'next/router';

import moment from 'moment';
import style from '../styles/rastreio.module.scss';

function ReactIcon({ status }: { status: string }): ReactElement {
  const st = [
    {
      out: <MdOutlineGetApp />,
      in: TaskStatus.FILE_CHECK,
    },
    {
      out: <GoPackage />,
      in: TaskStatus.PACKAGE_PICKED,
    },
    {
      out: <FaMotorcycle />,
      in: TaskStatus.PACKAGE_ACCEPTED,
    },
    {
      out: <FaMotorcycle />,
      in: TaskStatus.PACKAGE_ON_DELIVERY_ROUTE,
    },
    {
      out: <FaMotorcycle />,
      in: TaskStatus.PACKAGE_IS_NEAR,
    },
    {
      out: <FaCheckCircle />,
      in: TaskStatus.DELIVERY_SUCCESSFULLY,
    },
    {
      out: <MdOutlineSmsFailed />,
      in: TaskStatus.DELIVERY_FAILURE,
    },
    {
      out: <MdCancelPresentation />,
      in: TaskStatus.DELIVERY_ABORTED,
    },
    {
      out: <MdCancelPresentation />,
      in: TaskStatus.DELIVERY_CANCELLED,
    },
    {
      out: <RiImageAddFill />,
      in: TaskStatus.DELIVERY_PROTOCOL_ADDED,
    },
    {
      out: <TfiReload />,
      in: TaskStatus.UPDATED_DELIVERY_DATA,
    },
    {
      out: <MdNoteAdd />,
      in: TaskStatus.DELIVERY_NOTE_ADDED,
    },
  ].find((s) => s.in === status);
  return st?.out || <></>;
}

export default function Rastreio() {
  const [orderTrack, setOrder] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [isShowDetail, setShowDetail] = useState(['']);
  const [response, setResponse] = useState<TaskLogDTO | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tracking = async (orderTrackApi: string) => {
      setSending(true);
      setError(false);
      setIsPrivate(!!router.query.private);
      const responseApi = await axios.get(`/api/tracking?order=${orderTrackApi}`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
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
    if (router.query.order) {
      tracking(router.query.order.toString());
    }
  }, [router.query]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (router.isReady) {
      router.push(
        {
          query: null,
        },
        undefined,
        { shallow: true },
      );
    }
    setSending(true);
    setError(false);
    setIsPrivate(!!router.query.private);
    const responseApi = await axios.get(`/api/tracking?order=${orderTrack}`, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
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
      setShowDetail(isShowDetail.filter((id) => id !== value));
    } else setShowDetail([...isShowDetail, value]);
  }

  function adjustData(date:string) {
    const dataString = moment(date);
    return `${dataString.day() < 10 ? 0 : ''}${dataString.day()}/${dataString.month() < 10 ? 0 : ''}${dataString.month()}/${dataString.year()}
    ${dataString.hours()}:${dataString.minutes()}
    `;
  }

  return (
    <Layout>
      <section className={style.section}>
        <form>
          <InputForm
            label="código de rastreio"
            type="text"
            name="order"
            id="order"
            placeholder="PREFX-12365478"
            isRequired
            setOnChange={setOrder}
            value={orderTrack}
          />
          <Button handleSubmit={handleSubmit} sending={sending} text="Buscar" type="submit" />
          {!sending && error && <span className={style.errorMessage}>Desculpe, Erro ao buscar, tente novamente ou entre em contato.</span>}
          {submitted && !error && <span className={style.successMessage}>Sucesso ao buscar informações.</span>}
        </form>
        {!response ? (
          submitted && <p className={style.warn}>Nenhum pacote encontrado</p>
        ) : (
          <div className={style.result}>
            <div className={style.generalOrderInfo}>
              <p>
                <strong>Destinatário:</strong>
                {' '}
                {response?.task.name}
              </p>
              <p>
                <strong>Pedido:</strong>
                {' '}
                {response.task.orderId}
              </p>
              <p>
                <strong>Endereço:</strong>
                {' '}
                {response.task.address.formatted_address}
              </p>
              <p>
                <strong>Previsão de entrega:</strong>
                {' '}
                {response.task.forecast.slice(0, 10)}
              </p>
              <p>
                <strong>Último Status:</strong>
                {' '}
                {response.task.taskDescStatus}
              </p>
              {isPrivate && (
              <p>
                <strong>Origem interna (bid):</strong>
                {' '}
                conta
                {' '}
                {response.origin}
              </p>
              )}
            </div>
            <ul className={style.ul}>
              {response.history.map(
                (task) => task.taskStatus !== '0' && (
                <li key={task._id}>
                  <div className={style.init}>
                    <div className={style.icon}>
                      <ReactIcon status={task.taskDescStatus} />
                    </div>
                    <div className={style.status}>
                      <p>{`${task.taskDescStatus}`}</p>
                      <div className={style.statusInfo}>
                        <p>{adjustData(moment(task.created_at).subtract(3, 'hours').format('DD/MM/YYYY hh:mm:ss A'))}</p>
                        <p className={style.reason}>{task.reason ? task.reason : ''}</p>
                        {!isPrivate && (task.notes || task.imageArry?.length) && (
                        <p className={style.more_detail} onClick={() => showDetail(task._id)}>
                          mais detalhes
                        </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {isShowDetail.includes(task._id) && (task.notes || task.imageArry?.length) && (
                  <div className={style.detail}>
                    {task.notes && (
                    <p>
                      <strong>Notas:</strong>
                      {' '}
                      {task.notes}
                    </p>
                    )}
                    {task.imageArry?.length > 0 && (
                    <div>
                      <strong>Imagens:</strong>
                      {task.imageArry.map((img, i) => (
                        <a className={style.imagem} key={img} href={img} target="_blank" rel="noopener noreferrer">
                          <img src={img} alt={`Imagem ${i + 1}`} width="50px" height="50px" />
                        </a>
                      ))}
                    </div>
                    )}
                  </div>
                  )}
                </li>
                ),
              )}
            </ul>
          </div>
        )}
      </section>
    </Layout>
  );
}
