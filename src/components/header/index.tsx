import styles from "@/components/header/style.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BurgerButton from "../burgerButton";
import Logo from "../logo";

export default function Header() {
  const router = useRouter();
  useEffect(() => {
    document.body.addEventListener("scroll", (event) => {
      const scrollElement = document.body;
      const header = scrollElement.getElementsByClassName("header-js");
      if (header) {
        if (scrollElement.scrollTop > 100) {
          header[0].classList.add("active");
        } else {
          header[0].classList.remove("active");
        }
      }
    });
  }, []);
  return (
    <header className={`${styles.container} header-js`}>
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
