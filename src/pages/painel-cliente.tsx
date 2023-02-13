import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import Button from "@/components/button";
import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import style from "../styles/painel-cliente.module.scss";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendar2Check } from "react-icons/bs";

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingIndividual, setSendingIndividual] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const [messageError, setMessageError] = useState(
    " Desculpe, Erro ao enviar arquivo, tente novamente ou entre em contato."
  );
  const [fileName, setFileName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [fileSelected, setFileSelected] = useState<File | null>();

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [reference, setReference] = useState("");
  const [complement, setComplement] = useState("");
  const [number, setNumber] = useState("");
  const [order, setOrder] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [charDateInvalid, setCharDateInvalid] = useState(false);
  const [invalidDeliveryDate, setInvalidDeliveryDate] = useState(false);

  const [requiredError, setRequiredError] = useState(false);
  const [isLogged, setLogged] = useState(false);

  const router = useRouter();

  const handleMessageError = (msg: string) => {
    setMessageError(msg);
    router.push("#error");
  };

  const login = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    try {
      if (prefix == "" || password == "") {
        setError(true);
        throw new Error("Credenciais não informadas");
      }

      setError(false);

      const res = await fetch("/api/login", {
        method: "GET",
        headers: {
          "X-Company": prefix,
          "X-Authentication": password,
        },
      });

      const {
        status,
        error,
      }: {
        status: number;
        error: string | null;
      } = await res.json();

      if (status !== 200) {
        setError(true);
        throw new Error(error + ", entre em contato conosco!");
      }

      setLogged(true);
    } catch (error) {
      setError(true);
      handleMessageError("Erro, ao fazer login, entre em contato! " + error);
    }
  };

  const logout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    try {
      setLogged(false);
      setPrefix("");
      setPassword("");
    } catch (error) {
      setError(true);
      handleMessageError("Erro, fazer login " + error);
    }
  };

  const onCancelFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!fileSelected) {
      return;
    }
    setFileSelected(null);
    setFileName("");
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || !fileList[0]) {
      setError(true);
      handleMessageError("Erro ao selecionar arquivo!");
      return;
    }
    setFileSelected(fileList[0]);
    setFileName(fileList[0].name);
  };

  const getInfosByCep = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCep(e.target.value);
    if (e.target.value.length >= 8) {
      try {
        const res = await fetch(
          "/api/getInfosByCep" + "?cep=" + e.target.value,
          {
            method: "GET",
            headers: {
              "X-Company": prefix,
              "X-Authentication": password,
            },
          }
        );

        const {
          status,
          error,
          infos,
        }: {
          status: number;
          error: string | null;
          infos?: {
            rua: string;
            bairro: string;
            cidade: string;
            cep: string;
            estado: string;
          };
        } = await res.json();

        if (!infos) {
          setError(true);
          throw new Error(error + ", entre em contato conosco!");
        }

        setStreet(infos.rua);
        setNeighborhood(infos.bairro);
        setCity(infos.cidade);
        setState(infos.estado);
      } catch (error) {
        setError(true);
        handleMessageError("Erro, ao buscar informações, " + error);
      }
    } else {
      setStreet("");
      setNeighborhood("");
      setCity("");
      setState("");
    }
  };

  const individualHandleSubmit = async (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) e.preventDefault();
    setRequiredError(false);

    try {
      if (prefix == "" || password == "") {
        setError(true);
        throw new Error("Credenciais não informadas");
      }

      if (
        street == "" ||
        number == "" ||
        neighborhood == "" ||
        city == "" ||
        state == "" ||
        cep == "" ||
        !isValidDate(deliveryDate)
      ) {
        setError(true);
        setRequiredError(true);
        throw new Error(
          `preencha todos os campos obrigatórios, os campos obrigatórios possuem *, ${
            !isValidDate(deliveryDate) &&
            "verifique se a data de entrega não está para o final de semana"
          }`
        );
      }

      setSendingIndividual(true);
      setError(false);

      const data = {
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
        deliveryDate,
      };
      const res = await fetch("/api/sendTask", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "X-Company": prefix,
          "X-Authentication": password,
        },
      });

      const response: {
        status: number;
        error: string | null;
        orderNumber?: string;
      } = await res.json();

      if (!response.orderNumber) {
        setError(true);
        setSendingIndividual(false);
        throw new Error("Erro ao enviar pacote");
      }

      setSubmitted(true);
      setCep("");
      setStreet("");
      setNumber("");
      setComplement("");
      setReference("");
      setPhone("");
      setCity("");
      setNeighborhood("");
      setCity("");
      setOrder(response.orderNumber);
      setDeliveryDate("");
    } catch (error) {
      setError(true);
      handleMessageError("Erro, ao enviar informações, " + error);
    }
    setSendingIndividual(false);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    if (!fileSelected) {
      setError(true);
      throw new Error("Arquivo não selecionado!");
    }

    if (prefix == "" || password == "") {
      setError(true);
      throw new Error("Credenciais não informadas");
    }

    setSending(true);
    setError(false);

    try {
      var formData = new FormData();
      formData.append("media", fileSelected);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "X-Company": prefix,
          "X-Authentication": password,
        },
      });

      const {
        status,
        error,
      }: {
        status: number;
        error: string | null;
      } = await res.json();

      if (error && status == 401) {
        setError(true);
        setSending(false);
        throw new Error(error + "entre em contato conosco!");
      }

      if (error && status == 500) {
        setError(true);
        setSending(false);
        throw new Error("entre em contato!");
      }

      setSubmitted(true);
    } catch (error) {
      setError(true);
      handleMessageError("Erro, " + error);
    }
    setSending(false);
    setFileSelected(null);
    setFileName("");
  };

  async function downloadModel(e: React.MouseEvent) {
    e.preventDefault();
    try {
      setDownloading(true);
      const res = await fetch("/api/authenticate", {
        method: "GET",
        headers: {
          "X-Company": prefix,
          "X-Authentication": password,
        },
      });

      const {
        status,
        error,
      }: {
        status: number;
        error: string | null;
      } = await res.json();

      if (status != 200) {
        setError(true);
        setDownloading(false);
        throw new Error("entre em contato conosco!");
      }
      router.push(`/model.xlsx`);
      setDownloading(false);
    } catch (e) {
      setError(true);
      handleMessageError("Erro ao baixar modelo " + error);
    }
  }

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    setCharDateInvalid(false);
    console.log(e.key);
    if (e.key === "Enter") {
      e.preventDefault();
    }
    if (e.key === "Backspace") setCharDateInvalid(true);
  };

  const handleKeypressDate = (e: KeyboardEvent<HTMLInputElement>) => {
    setCharDateInvalid(false);
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace") {
      setCharDateInvalid(true);
      return;
    }
  };

  function isNumber(value: string) {
    if (typeof value === "string") {
      return !isNaN(parseInt(value));
    }
  }

  const setDateDeliveryByCalendar = (date: Date) => {
    setInvalidDeliveryDate(false);
    setInvalidDeliveryDate(!isValidDate(moment(date).format("DD/MM/YYYY")));
    setDeliveryDate(moment(date).format("DD/MM/YYYY"));
  };

  const setDateDelivery = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInvalidDeliveryDate(false);
    if (charDateInvalid) {
      setDeliveryDate(e.target.value);
      return;
    }
    if (!isNumber(e.target.value)) {
      setCharDateInvalid(true);
      return;
    }
    let dateFormatted = e.target.value;
    if (dateFormatted.length == 2) dateFormatted = dateFormatted + "/";
    if (dateFormatted.length == 5) dateFormatted = dateFormatted + "/";
    if (dateFormatted.length <= 10) setDeliveryDate(dateFormatted);
    if (e.target.value.length === 10) {
      setInvalidDeliveryDate(!isValidDate(e.target.value));
    }
  };

  function isValidDate(date: string) {
    const day = date.substring(0, 2);
    const month = date.substring(3, 5);
    const year = date.substring(6, 10);
    if (isWeekDay(`${year}-${month}-${day}`)) {
      return false;
    }
    return moment(`${year}-${month}-${day}`).isValid();
  }

  function isWeekDay(date: string, validWeekDays: number[] = [6, 7]) {
    let dateConverted = moment(date);
    const weekday = dateConverted.isoWeekday();
    if (validWeekDays.includes(weekday)) {
      return true;
    }
    return false;
  }

  return (
    <Layout simpleHeader={true}>
      <section className={style.section}>
        <form className={style.loginForm}>
          <InputForm
            label='Prefixo'
            type='text'
            name='prefix'
            id='prefix'
            placeholder='PREFX'
            isRequired={true}
            alertRequired={requiredError && prefix == ""}
            setOnChange={setPrefix}
            value={prefix}
            disable={isLogged}
          />
          <InputForm
            label='Senha'
            type='password'
            name='password'
            id='password'
            placeholder='*********'
            isRequired={true}
            alertRequired={requiredError && password == ""}
            setOnChange={setPassword}
            value={password}
            disable={isLogged}
          />
          <Button
            handleSubmit={!isLogged ? login : logout}
            sending={sendingIndividual}
            text={!isLogged ? "Entrar" : "Sair"}
            id='login'
            type='submit'
          />
        </form>
        {isLogged && (
          <>
            {order == "" ? (
              <form className={style.individualForm}>
                <InputForm
                  label='CEP *'
                  type='text'
                  name='cep'
                  id='cep'
                  placeholder='60123456'
                  isRequired={true}
                  alertRequired={requiredError && cep == ""}
                  onChange={getInfosByCep}
                  value={cep}
                  onKeyDown={handleKeypress}
                  classPlus={style.i1}
                />
                <InputForm
                  label='Rua'
                  type='text'
                  name='street'
                  id='street'
                  placeholder=''
                  isRequired={true}
                  alertRequired={requiredError && street == ""}
                  setOnChange={setStreet}
                  value={street}
                  onKeyDown={handleKeypress}
                  disable={true}
                  classPlus={style.i2}
                />
                <InputForm
                  label='Bairro'
                  type='text'
                  name='neighborhood'
                  id='neighborhood'
                  placeholder=''
                  isRequired={true}
                  alertRequired={requiredError && neighborhood == ""}
                  setOnChange={setNeighborhood}
                  value={neighborhood}
                  onKeyDown={handleKeypress}
                  disable={true}
                  classPlus={style.i3}
                />
                <InputForm
                  label='Estado'
                  type='text'
                  name='state'
                  id='state'
                  placeholder=''
                  isRequired={true}
                  alertRequired={requiredError && state == ""}
                  setOnChange={setState}
                  value={state}
                  onKeyDown={handleKeypress}
                  disable={true}
                  classPlus={style.i4}
                />
                <InputForm
                  label='Número *'
                  type='text'
                  name='number'
                  id='number'
                  placeholder='123'
                  isRequired={true}
                  alertRequired={requiredError && number == ""}
                  setOnChange={setNumber}
                  value={number}
                  onKeyDown={handleKeypress}
                  classPlus={style.i5}
                />
                <InputForm
                  label='Telefone *'
                  type='text'
                  name='phone'
                  id='phone'
                  placeholder='85 989888888'
                  isRequired={true}
                  alertRequired={requiredError && phone == ""}
                  setOnChange={setPhone}
                  value={phone}
                  onKeyDown={handleKeypress}
                  classPlus={style.i6}
                />
                <InputForm
                  label='Complemento'
                  type='text'
                  name='complement'
                  id='complement'
                  placeholder='Casa | Apartamento | ap 14'
                  isRequired={false}
                  setOnChange={setComplement}
                  value={complement}
                  onKeyDown={handleKeypress}
                  classPlus={style.i7}
                />
                <InputForm
                  label='Ponto de referência'
                  type='text'
                  name='reference'
                  id='reference'
                  placeholder='próximo ao bar do seu zé'
                  isRequired={false}
                  setOnChange={setReference}
                  value={reference}
                  onKeyDown={handleKeypress}
                  classPlus={style.i8}
                />
                <InputForm
                  label='Destinatário *'
                  type='text'
                  name='recipient'
                  id='recipient'
                  placeholder='josé da silva'
                  isRequired={true}
                  setOnChange={setRecipient}
                  value={recipient}
                  onKeyDown={handleKeypress}
                  classPlus={style.i8}
                  alertRequired={requiredError && recipient == ""}
                />
                <InputForm
                  label='Data de entrega *'
                  type='text'
                  name='deliveryDate'
                  id='deliveryDate'
                  placeholder='21/12/2023'
                  isRequired={true}
                  onChange={setDateDelivery}
                  value={deliveryDate}
                  onKeyDown={handleKeypressDate}
                  classPlus={style.i9}
                  alertRequired={
                    (requiredError && deliveryDate == "") || invalidDeliveryDate
                  }>
                  <div className={style.calendarIconContainer}>
                    <div className={style.iconContainer}>
                      <div className={style.iconCalendar}>
                        <BsCalendar2Check />
                      </div>
                      <DatePicker
                        calendarClassName={style.calendar}
                        wrapperClassName={style.buttonCalendarIcon}
                        onChange={setDateDeliveryByCalendar}
                      />
                    </div>
                  </div>
                </InputForm>

                <Button
                  handleSubmit={individualHandleSubmit}
                  sending={sendingIndividual}
                  text='Enviar'
                  id='endButton'
                  type='submit'
                  plusClass={style.i10}
                />
              </form>
            ) : (
              <div className={style.resultIndividualForm}>
                <div>
                  Este é o número do seu pedido: <strong>{order}</strong>
                </div>
                <span>anote na sua encomenda e o resto é com a gente.</span>
                <Button
                  plusClass={style.resultButton}
                  handleSubmit={() => setOrder("")}
                  sending={downloading}
                  text='Inserir outro'
                  type='button'
                />
              </div>
            )}

            <form className={style.inLoteForm}>
              <div className={style.inputUp}>
                <label htmlFor='table' className={style.choose_btn}>
                  {fileName != ""
                    ? `Arquivo selecionado: ${fileName}`
                    : "Escolher arquivo"}
                </label>
                <input
                  accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                  id='table'
                  name='table'
                  type='file'
                  multiple={false}
                  onChange={handleFileChange}
                  onKeyDown={handleKeypress}
                />
                {fileSelected && (
                  <button onClick={onCancelFile}>Cancelar</button>
                )}
                <Button
                  plusClass={style.modelButton}
                  handleSubmit={downloadModel}
                  sending={downloading}
                  text='Baixar tabela modelo'
                  type='button'
                />
              </div>
              <Button
                handleSubmit={handleSubmit}
                sending={sending}
                text='Enviar'
                id='endButton'
                type='submit'
              />
            </form>
          </>
        )}
        {error && (
          <span id='error' className={style.errorMessage}>
            {messageError}
          </span>
        )}
        {submitted && !error && (
          <span className={style.successMessage}>Sucesso ao enviar.</span>
        )}
      </section>
    </Layout>
  );
}
