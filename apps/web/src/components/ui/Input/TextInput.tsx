// src/components/ui/fields/inputs.tsx
import * as React from 'react'
import { BaseInputField, InputBaseProps } from '@/components/ui/Input/BaseInputField'


export const TextInput = React.forwardRef<HTMLInputElement, InputBaseProps>(
   (props, ref) => <BaseInputField ref={ref} {...props} type="text" />,
)
TextInput.displayName = 'TextInput'
