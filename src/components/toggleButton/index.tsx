import Props from "./props";
import style from "./style.module.scss";
export default function ToggleButton({ handle }: Props) {
  return (
    <label className={style.switch}>
      <input className={style.input} type='checkbox' onClick={handle} />
      <span className={style.slider}></span>
    </label>
  );
}
