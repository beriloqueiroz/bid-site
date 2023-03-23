import { useReducers } from '@/lib/redux/hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import style from './style.module.scss';

export default function Error() {
  const {
    hasError, message,
  } = useReducers('error.hasError', 'error.message');
  const router = useRouter();

  useEffect(() => {
    if (hasError && !router.pathname.includes('#error')) {
      router.push('#error');
    }
  }, [hasError]);

  return (
    <div className={style.container}>
      { hasError && (
      <span id="error" className={style.errorMessage}>
        {message}
      </span>
      )}
    </div>
  );
}

// { submitted && !errorGeral && <span className={style.successMessage}>Sucesso ao enviar.</span>; }
