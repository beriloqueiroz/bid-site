import { ChangeEvent, ChangeEventHandler } from "react";
import Props from "./props";
import style from "./style.module.scss";
export default function InputForm({
  name,
  type,
  id,
  placeholder,
  isRequired,
  setOnChange,
  isTextArea,
  value,
  label,
  onKeyDown
}: Props) {
  function setChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    setOnChange(e.target.value);
  }
  return (
    <>
      <label className={style.label} htmlFor={name}>
        {label}
      </label>
      {!isTextArea ? (
        <input
          className={style.input}
          type={type}
          name={name}
          id={id}
          placeholder={placeholder}
          required={isRequired}
          onChange={setChange}
          value={value}
          onKeyDown={onKeyDown}
        />
      ) : (
        <textarea
          className={style.textarea}
          name={name}
          id={id}
          placeholder={placeholder}
          onChange={setChange}
          value={value}
        />
      )}
    </>
  );
}
