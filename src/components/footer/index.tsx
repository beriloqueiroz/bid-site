import styles from "@/components/footer/style.module.scss";
import { useRouter } from "next/router";
import Logo from "../logo";
import WhatsappButton from "../whatsappButton";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.infos}>
          <Logo />
          <p>bid transporte inteligente</p>
          <p>bid © 2023. Todos os direitos reservados.</p>
          <div onClick={() => router.push("/privacidade")}>
            Política de Privacidade e Cookies | Termos de uso
          </div>
        </div>
        <div className={styles.aboutUs}>
          <h1>bid</h1>
          <p onClick={() => router.push("#sobre")}>Conheça a bid</p>
          <p onClick={() => router.push("#contato")}>Fale conosco</p>
        </div>
        <div className={styles.social}>
          <h1>REDES SOCIAIS</h1>
          <a
            href='https://www.instagram.com/bid.log/'
            target='_blank'
            rel='noopener noreferrer'>
            Instagram
          </a>
          <a
            href='https://br.linkedin.com/in/bid.log'
            target='_blank'
            rel='noopener noreferrer'>
            Linkedin
          </a>
        </div>
      </div>
      <WhatsappButton />
    </footer>
  );
}
