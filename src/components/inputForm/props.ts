import { Dispatch, KeyboardEventHandler, SetStateAction } from "react"

export default interface Props {
    name: string
    type?: string
    id: string
    placeholder: string
    isRequired?: boolean
    setOnChange: Dispatch<SetStateAction<string>>;
    isTextArea?: boolean
    value: string
    label: string
    onKeyDown?:KeyboardEventHandler<HTMLInputElement> 
}