import { LegacyRef, MouseEventHandler } from 'react';

export default interface Props {
  handleSubmit: MouseEventHandler<HTMLButtonElement>
  sending: boolean
  text?: string
  plusClass?: string
  ref?: LegacyRef<HTMLButtonElement>
  id?: string
  type: 'submit' | 'button' | 'reset' | undefined
}
