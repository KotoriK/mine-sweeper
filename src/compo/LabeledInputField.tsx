import {  forwardRef } from "react"

export interface LabeledInputFieldProps {
    caption: string
    defaultValue:string
    className?:string
}
const LabeledInputField = forwardRef<HTMLInputElement, LabeledInputFieldProps>(({ className,caption,defaultValue }: LabeledInputFieldProps, ref) =>
    <label className={className}>{caption}<input ref={ref} type="number" step="1" defaultValue={defaultValue}></input></label>)

export default LabeledInputField
