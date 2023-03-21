import { useState } from 'react';

import style from '@/components/burgerButton/style.module.scss';

import SideBar from '../sideBar';

export default function BurgerButton() {
  const [isShowSideBar, setShowSideBar] = useState<boolean>(true);
  return (
    <>
      <div className={style.burger} onClick={() => setShowSideBar(!isShowSideBar)}>
        <div className={`${style.burgerLayer} ${!isShowSideBar ? style.active : ''}`} />
      </div>
      <SideBar active={!isShowSideBar} setActive={setShowSideBar} />
    </>
  );
}
