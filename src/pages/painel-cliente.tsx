import Layout from "@/components/layout";
import SubmitButton from "@/components/submitButton";
import axios from "axios";
import { useState } from "react";
import style from "../styles/painel-cliente.module.scss";

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [fileName, setFileName] = useState("");
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
      return;
    }
    setFileSelected(fileList[0]);
    setFileName(fileList[0].name);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!fileSelected) {
      setError(true);
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
          "X-Company": "MAQAD",
          "X-Authentication": "123645",
        },
      });

      const {
        status,
        error,
      }: {
        status: string;
        error: string | null;
      } = await res.json();

      if (error && status == "Nok") {
        setError(true);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setError(true);
    }
    setSending(false);
    setFileSelected(null);
    setFileName("");
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
            />
            {fileSelected && <button onClick={onCancelFile}>Cancelar</button>}
          </div>

          <SubmitButton
            handleSubmit={handleSubmit}
            sending={sending}
            text='Enviar'
          />
          {error && (
            <span className={style.errorMessage}>
              Desculpe, Erro ao enviar arquivo, tente novamente ou entre em
              contato.
            </span>
          )}
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
