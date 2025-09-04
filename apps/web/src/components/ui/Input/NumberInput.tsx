import * as React from 'react'
import { BaseInputField, InputBaseProps } from './BaseInputField'

export interface NumberInputProps extends InputBaseProps {

}


export const NumberInputField = React.forwardRef<HTMLInputElement, NumberInputProps>(
   (props, ref) => <BaseInputField ref={ref} {...props} type="number" />,
)
NumberInput.displayName = 'NumberInput'
