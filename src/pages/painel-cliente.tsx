import InputForm from "@/components/inputForm";
import Layout from "@/components/layout";
import Button from "@/components/button";
import { useRouter } from "next/router";
import { KeyboardEvent, useState } from "react";
import style from "../styles/painel-cliente.module.scss";

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const [messageError, setMessageError] = useState(
    " Desculpe, Erro ao enviar arquivo, tente novamente ou entre em contato."
  );
  const [fileName, setFileName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [fileSelected, setFileSelected] = useState<File | null>();

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

  const router = useRouter();
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
      handleSubmit();
    }
  };

  return (
    <Layout simpleHeader={true}>
      <section className={style.section}>
        <form>
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
          <Button
            handleSubmit={handleSubmit}
            sending={sending}
            text='Enviar'
            id='endButton'
            type='submit'
          />
          {error && <span className={style.errorMessage}>{messageError}</span>}
          {submitted && !error && (
            <span className={style.successMessage}>
              Sucesso ao enviar arquivo.
            </span>
          )}
        </form>
      </section>
    </Layout>
  );
}
