import { Props } from './props';
import style from './style.module.scss';

export default function ToggleButton({ handle }: Props) {
  return (
    <label className={style.switch} htmlFor="inp">
      <input className={style.input} type="checkbox" name="inp" id="inp" onClick={handle} />
      <span className={style.slider} />
    </label>
  );
}
