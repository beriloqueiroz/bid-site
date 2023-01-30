import { Dispatch, SetStateAction } from "react"

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
}