/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ChangeEvent } from 'react';

import { Props } from './props';
import style from './style.module.scss';

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
  classPlus = '',
  alertRequired = false,
  pattern,
  children,
  isSelect,
  selectOnChange,
  optionsSelect,
  littleLabel,
  destac = false,
}: Props) {
  function setChange(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) {
    !!setOnChange && setOnChange(e.target.value);
  }
  if (isTextArea) {
    return (
      <div className={`${style.container} ${classPlus}`}>
        <label className={style.label} htmlFor={name}>
          {label}
          {littleLabel && <div className={style.littleLabel}>{littleLabel}</div>}
        </label>
        <textarea className={style.textarea} name={name} id={id} placeholder={placeholder} onChange={setChange} value={value} disabled={disable} />
      </div>
    );
  }
  if (isSelect) {
    return (
      <div className={`${style.container} ${classPlus}`}>
        <label className={style.label} htmlFor={name}>
          {label}
          {littleLabel && <div className={style.littleLabel}>{littleLabel}</div>}
        </label>
        <select
          name={name}
          id={id}
          className={`${style.input} ${alertRequired ? style.alertRequired : ''}`}
          placeholder={placeholder}
          required={isRequired}
          onChange={selectOnChange || setChange}
          value={value}
          disabled={disable}
        >
          {optionsSelect?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.content}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={`${style.container} ${classPlus}`}>
      <label className={`${style.label} ${destac ? style.destac : ''}`} htmlFor={name}>
        {label}
        {littleLabel && <div className={style.littleLabel}>{littleLabel}</div>}
      </label>
      <input
        className={`${style.input} ${alertRequired ? style.alertRequired : ''} ${destac ? style.destac_input : ''}`}
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
    </div>
  );
}
