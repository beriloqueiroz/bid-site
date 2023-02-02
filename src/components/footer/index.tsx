import styles from "@/components/footer/style.module.scss";
import { useRouter } from "next/router";
import Logo from "../logo";
import PrivacyModal from "../privacyModal";
import WhatsappButton from "../whatsappButton";

export default function Footer() {
  const router = useRouter();
  const whatsPhone = "5585997492562";
  const whatsappMessage =
    "Olá, estou interessado nos serviços da bid e gostaria de mais informações.";

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.infos}>
          <Logo />
          <p>bid transporte inteligente</p>
          <p>bid © 2023. Todos os direitos reservados.</p>
          <div onClick={() => router.push("/politica-privacidade-cookies")}>
            Política de Privacidade e Cookies
          </div>
          {/* <div onClick={() => router.push("/termos")}>Termos de uso</div> */}
        </div>
        <div className={styles.aboutUs}>
          <h1>EMPRESA</h1>
          <p onClick={() => router.push("/#sobre")}>Conheça a bid</p>
          <p onClick={() => router.push("/#contato")}>
            Fale conosco | Trabalhe conosco
          </p>
        </div>
        <div className={styles.aboutUs}>
          <h1>CONTATO</h1>
          <a
            href={`https://api.whatsapp.com/send/?phone=${whatsPhone}&text=${whatsappMessage}&type=phone_number&app_absent=0`}
            target='_blank'
            rel='noopener noreferrer'>
            +55 85 997492562 (Whatsapp)
          </a>
          <a
            href='mailto:contato@bid.log.br'
            target='_blank'
            rel='noopener noreferrer'>
            contato@bid.log.br
          </a>
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
            href='https://www.linkedin.com/company/bid-log'
            target='_blank'
            rel='noopener noreferrer'>
            Linkedin
          </a>
        </div>
      </div>
      <WhatsappButton />
      <PrivacyModal />
    </footer>
  );
}
