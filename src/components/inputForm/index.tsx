import { ChangeEvent, ChangeEventHandler, Dispatch } from "react";
import Props from "./props";
import style from "./style.module.scss";
export default function InputForm({
  name,
  type,
  id,
  placeholder,
  isRequired,
  setOnChange,
  onChange,
  isTextArea,
  value,
  label,
  onKeyDown,
  disable = false,
  classPlus = "",
  alertRequired = false,
  pattern,
  children,
}: Props) {
  function setChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    setOnChange && setOnChange(e.target.value);
  }
  return (
    <div className={`${style.container} ${classPlus}`}>
      <label className={style.label} htmlFor={name}>
        {label}
      </label>
      {!isTextArea ? (
        <>
          <input
            className={`${style.input} ${
              alertRequired ? style.alertRequired : ""
            }`}
            type={type}
            name={name}
            id={id}
            placeholder={placeholder}
            required={isRequired}
            onChange={onChange || setChange}
            value={value}
            onKeyDown={onKeyDown}
            disabled={disable}
            pattern={pattern}
          />
          {children}
        </>
      ) : (
        <textarea
          className={style.textarea}
          name={name}
          id={id}
          placeholder={placeholder}
          onChange={setChange}
          value={value}
          disabled={disable}
        />
      )}
    </div>
  );
}
