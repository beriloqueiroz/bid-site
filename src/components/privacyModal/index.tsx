import { useEffect, useState } from 'react';

import cookies from 'js-cookie';
import { useRouter } from 'next/router';

import style from './style.module.scss';

export default function PrivacyModal() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const acceptedCookie = cookies.get('bid-cookie-bar');
    if (acceptedCookie === 'true') {
      const expireAcceptedCookie = cookies.get('expires');
      if (expireAcceptedCookie) {
        if (Date.parse(expireAcceptedCookie) < Date.now()) {
          setShowModal(true);
        }
      }
    } else {
      setShowModal(true);
    }
  }, []);

  function acceptCookies() {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    cookies.set('bid-cookie-bar', 'true');
    cookies.set('expires', expireDate.toString());
    setShowModal(false);
  }
  if (!showModal) return null;
  return (
    <div className={style.container} id="cookieBar">
      <div className={style.text}>
        <p>Nós usamos cookies e outras tecnologias semelhantes para melhorar a sua experiência em nossos serviços.</p>
        <p>
          Ao utilizar nossos serviços, você concorda com nossa
          {' '}
          <span onClick={() => router.push('/politica-privacidade-cookies/#politica-inicio')}>políticas de privacidade</span>
        </p>
      </div>
      <button type="button" onClick={() => acceptCookies()}>Prosseguir</button>
    </div>
  );
}
