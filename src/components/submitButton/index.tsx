import Props from "./props";
import styles from "./style.module.scss";
export default function SubmitButton({
  sending,
  handleSubmit,
  text = "Enviar",
}: Props) {
  return (
    <button className={styles.button} type='submit' onClick={handleSubmit}>
      {!sending ? text : <div className={styles.loading}></div>}
    </button>
  );
}
