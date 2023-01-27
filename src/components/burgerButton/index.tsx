import style from "@/components/burgerButton/style.module.scss";
import { useState } from "react";
import SideBar from "../sideBar";
export default function BurgerButton() {
  const [isShowSideBar, setShowSideBar] = useState<boolean>(true);
  return (
    <>
      <div
        className={style.burger}
        onClick={() => setShowSideBar(!isShowSideBar)}>
        <div
          className={`${style.burgerLayer} ${
            !isShowSideBar ? style.active : ""
          }`}></div>
      </div>
      <SideBar active={!isShowSideBar} setActive={setShowSideBar} />
    </>
  );
}
