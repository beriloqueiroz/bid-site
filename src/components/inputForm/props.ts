import { ChangeEventHandler, Dispatch, KeyboardEventHandler, ReactNode, SetStateAction } from "react";

export default interface Props {
  name: string;
  type?: string;
  id: string;
  placeholder: string;
  isRequired?: boolean;
  setOnChange?: Dispatch<SetStateAction<string>>;
  isTextArea?: boolean;
  value: string;
  label: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  disable?: boolean | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  selectOnChange?: ChangeEventHandler<HTMLSelectElement> | undefined;
  classPlus?: string;
  alertRequired?: boolean;
  pattern?: string;
  children?: ReactNode;
  isSelect?: boolean;
  optionsSelect?: OptionSelect[];
}

export type OptionSelect = {
  value: string;
  content: string;
};
