import {
  ChangeEventHandler, Dispatch, KeyboardEventHandler, ReactNode, SetStateAction,
} from 'react';

export interface Props {
  name: string;
  type?: string;
  id: string;
  placeholder: string;
  isRequired?: boolean;
  setOnChange?: Dispatch<SetStateAction<any>>;
  isTextArea?: boolean;
  value: string | number;
  label: string;
  littleLabel?: string;
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
  destac?:boolean
}

export type OptionSelect = {
  value: string;
  content: string;
};
