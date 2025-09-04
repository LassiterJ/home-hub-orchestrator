import * as React from 'react'
import { BaseInput } from '@/components/ui/Input/BaseInput'
import { cn } from '@/utils'
import { NumberInput } from '@/components/ui/Input/NumberInput'
import { TextInput } from '@/components/ui/Input/TextInput'

export interface InputBaseProps {
   id: string,
   type: string,
   name?: string
   label?: React.ReactNode
   description?: React.ReactNode | string,
   error?: React.ReactNode | string,
   className?: string
   disabled?: boolean
   required?: boolean
   startIcon?: React.ReactNode
   endIcon?: React.ReactNode
}

type AllowedInputComponent =
   | typeof BaseInput
   | typeof TextInput
   | typeof NumberInput;

type AllowedInputElement =
   | React.ReactElement<React.ComponentPropsWithoutRef<typeof BaseInput>>
   | React.ReactElement<React.ComponentPropsWithoutRef<typeof TextInput>>
   | React.ReactElement<React.ComponentPropsWithoutRef<typeof NumberInput>>;


interface BaseFieldProps extends InputBaseProps {
   compact?: boolean,
   containerClassName?: string,
   type: string,
   children?: AllowedInputElement | undefined
}

export const BaseInputField = React.forwardRef<HTMLInputElement, BaseFieldProps>(
   (
      {
         label,
         description,
         error,
         startIcon,
         endIcon,
         compact,
         containerClassName,
         className,
         id,
         type = 'text',
         children = undefined,
         ...props
      },
      ref,
   ) => {
      // If nothing “fieldy” is provided, render a plain BaseInput (no extra wrapper)
      const plain = !label && !description && !error && !startIcon && !endIcon

      const sizeClasses = compact ? 'h-8 text-xs px-2' : 'h-9'
      const withIconLeft = startIcon ? (compact ? 'pl-7' : 'pl-9') : undefined
      const withIconRight = endIcon ? (compact ? 'pr-7' : 'pr-9') : undefined


      const Component: AllowedInputComponent = children || BaseInput
      if (plain) {
         return (
            <Component
               ref={ref}
               type={type}
               className={cn(sizeClasses, className)}
               id={id}
               {...props}
            />
         )
      }

      const inputId = id ?? React.useId()

      return (
         <div className={cn('grid gap-1', containerClassName)}>
            {label && (
               <label
                  htmlFor={inputId}
                  className={cn('text-sm font-medium', compact && 'text-xs')}
               >
                  {label}
               </label>
            )}

            <div className="relative">
               {startIcon && (
                  <span className={cn(
                     'pointer-events-none absolute inset-y-0 left-2 flex items-center',
                     compact && 'text-xs',
                  )}>
              {startIcon}
            </span>
               )}

               <Component
                  ref={ref}
                  id={inputId}
                  type={type}
                  aria-invalid={!!error || undefined}
                  className={cn(
                     sizeClasses,
                     withIconLeft,
                     withIconRight,
                     error && 'ring-1 ring-destructive/50 border-destructive',
                     className,
                  )}
                  {...props}
               />

               {endIcon && (
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              {endIcon}
            </span>
               )}
            </div>

            {description && (
               <p className={cn('text-xs text-muted-foreground', compact && 'text-[10px]')}>
                  {description}
               </p>
            )}
            {error && (
               <p className={cn('text-xs text-destructive', compact && 'text-[10px]')}>
                  {error}
               </p>
            )}
         </div>
      )
   },
)
BaseInputField.displayName = 'BaseInputField'
