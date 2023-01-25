import WhatsappButton from "../whatsappButton";
import footerStyles from "@/components/footer/style.module.scss";

export default function Footer() {
  const cellphone = "5585989071945";
  const email = "contato@bid.log.br";
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.classic}>
        <a href={`tel:${cellphone}`} target='_blank' rel='noreferrer'>
          telefone: {cellphone}
        </a>
        <a href={`mailto:${email}`} target='_blank' rel='noreferrer'>
          e-mail: {email}
        </a>
        <a href={`linkedin.com/beriloqueiroz`} target='_blank' rel='noreferrer'>
          linkedin: {email}
        </a>
      </div>
      <WhatsappButton />
    </footer>
  );
}
