import styles from "@/components/header/style.module.scss";
import { useRouter } from "next/router";
import BurgerButton from "../burgerButton";
import Logo from "../logo";

export default function Header() {
  const router = useRouter();
  return (
    <header className={styles.container}>
      <div className={styles.mobile_menu}>
        <Logo />
        <BurgerButton />
      </div>
      <div className={styles.desktop_menu}>
        <Logo />
        <div className={styles.links}>
          <nav>
            <ul>
              <li onClick={() => router.push("#sobre")}>
                FAZEMOS SUAS ENTREGAS
              </li>
              <li onClick={() => router.push("#contato")}>CONTATO</li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
