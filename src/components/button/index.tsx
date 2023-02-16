import Props from "./props";
import styles from "./style.module.scss";
export default function Button({ sending, handleSubmit, text = "Enviar", plusClass = "", ref, id, type }: Props) {
  return (
    <button id={id} className={`${styles.button} ${plusClass}`} type={type} onClick={handleSubmit} ref={ref}>
      {!sending ? text : <div className={styles.loading}></div>}
    </button>
  );
}
