import { ChangeEventHandler, Dispatch, KeyboardEventHandler, ReactNode, SetStateAction } from "react"

export default interface Props {
    name: string
    type?: string
    id: string
    placeholder: string
    isRequired?: boolean
    setOnChange?: Dispatch<SetStateAction<string>>;
    isTextArea?: boolean
    value: string
    label: string
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>
    disable?: boolean | undefined
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined
    classPlus?: string
    alertRequired?: boolean
    pattern?: string
    children?: ReactNode;

}