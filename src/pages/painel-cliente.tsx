import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import Button from "@/components/button";
import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import style from "../styles/painel-cliente.module.scss";

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

  const router = useRouter();

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
      setMessageError("Erro ao selecionar!");
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
        const res = await fetch("/api/getInfosByCep" + "?cep=" + cep, {
          method: "GET",
          headers: {
            "X-Company": prefix,
            "X-Authentication": password,
          },
        });

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
          setMessageError(error + ", entre em contato conosco!");
          return;
        }

        setStreet(infos.rua);
        setNeighborhood(infos.bairro);
        setCity(infos.cidade);
        setState(infos.estado);
      } catch (error) {
        setError(true);
        setMessageError("Erro, ao enviar informações, entre em contato!");
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

    if (prefix == "" || password == "") {
      setError(true);
      setMessageError("Erro, Credenciais não informadas");
      return;
    }

    if (
      street == "" ||
      number == "" ||
      neighborhood == "" ||
      city == "" ||
      state == "" ||
      cep == ""
    ) {
      setError(true);
      setMessageError(
        "Erro, preencha todos os campos obrigatórios, os campos obrigatórios possuem *"
      );
      return;
    }

    setSendingIndividual(true);
    setError(false);

    let orderNumber = "";

    try {
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

      orderNumber = response.orderNumber;
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
    } catch (error) {
      setError(true);
      setMessageError(
        "Erro, ao enviar informações, entre em contato! " + error
      );
    }
    setSendingIndividual(false);
    setOrder(orderNumber);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    if (!fileSelected) {
      setError(true);
      setMessageError("Erro, Arquivo não selecionado!");
      return;
    }

    if (prefix == "" || password == "") {
      setError(true);
      setMessageError("Erro, Credenciais não informadas");
      return;
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
        setMessageError(error + ", entre em contato conosco!");
        setSending(false);
        return;
      }

      if (error && status == 500) {
        setError(true);
        setMessageError("Erro, ao enviar aquivo, entre em contato!");
        setSending(false);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setError(true);
      setMessageError("Erro, ao enviar aquivo, entre em contato!");
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
        setMessageError("Erro ao baixar modelo, entre em contato conosco!");
        setDownloading(false);
        return;
      }
      router.push(`/model.xlsx`);
      setDownloading(false);
    } catch (e) {
      setError(true);
      setMessageError("Erro ao baixar modelo, entre em contato conosco!");
    }
  }

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

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
            setOnChange={setPrefix}
            value={prefix}
            onKeyDown={handleKeypress}
          />
          <InputForm
            label='Senha'
            type='password'
            name='password'
            id='password'
            placeholder='*********'
            isRequired={true}
            setOnChange={setPassword}
            value={password}
            onKeyDown={handleKeypress}
          />
        </form>

        {order == "" ? (
          <form className={style.individualForm}>
            <InputForm
              label='CEP *'
              type='text'
              name='cep'
              id='cep'
              placeholder='60123456'
              isRequired={true}
              onChange={getInfosByCep}
              value={cep}
              onKeyDown={handleKeypress}
            />
            <InputForm
              label='Rua'
              type='text'
              name='street'
              id='street'
              placeholder=''
              isRequired={true}
              setOnChange={setStreet}
              value={street}
              onKeyDown={handleKeypress}
              disable={true}
            />
            <InputForm
              label='Bairro'
              type='text'
              name='neighborhood'
              id='neighborhood'
              placeholder=''
              isRequired={true}
              setOnChange={setNeighborhood}
              value={neighborhood}
              onKeyDown={handleKeypress}
              disable={true}
            />
            <InputForm
              label='Estado'
              type='text'
              name='state'
              id='state'
              placeholder=''
              isRequired={true}
              setOnChange={setState}
              value={state}
              onKeyDown={handleKeypress}
              disable={true}
            />
            <InputForm
              label='Número *'
              type='text'
              name='number'
              id='number'
              placeholder='123'
              isRequired={true}
              setOnChange={setNumber}
              value={number}
              onKeyDown={handleKeypress}
            />
            <InputForm
              label='Telefone *'
              type='text'
              name='phone'
              id='phone'
              placeholder='85 989888888'
              isRequired={true}
              setOnChange={setPhone}
              value={phone}
              onKeyDown={handleKeypress}
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
            />
            <Button
              handleSubmit={individualHandleSubmit}
              sending={sendingIndividual}
              text='Enviar'
              id='endButton'
              type='submit'
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
            {fileSelected && <button onClick={onCancelFile}>Cancelar</button>}
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
        {error && <span className={style.errorMessage}>{messageError}</span>}
        {submitted && !error && (
          <span className={style.successMessage}>
            Sucesso ao enviar arquivo.
          </span>
        )}
      </section>
    </Layout>
  );
}
