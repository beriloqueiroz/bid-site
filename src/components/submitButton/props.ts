import { MouseEventHandler } from "react"

export default interface Props {
    handleSubmit: MouseEventHandler<HTMLButtonElement>
    sending: boolean
    text?: string
}