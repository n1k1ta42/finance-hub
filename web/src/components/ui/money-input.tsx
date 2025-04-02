import { cn } from '@/lib/utils'
import React from 'react'
import type { NumericFormatProps } from 'react-number-format'
import { NumericFormat } from 'react-number-format'

export interface MoneyInputProps extends Omit<NumericFormatProps, 'className'> {
  className?: string
  prefix?: string
  suffix?: string
  error?: boolean
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      prefix = '',
      suffix = ' ₽',
      decimalScale = 2,
      thousandSeparator = ' ',
      error,
      ...props
    },
    ref,
  ) => {
    return (
      <NumericFormat
        getInputRef={ref}
        className={cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        thousandSeparator={thousandSeparator}
        decimalScale={decimalScale}
        prefix={prefix}
        suffix={suffix}
        decimalSeparator='.'
        allowNegative={false}
        {...props}
      />
    )
  },
)

MoneyInput.displayName = 'MoneyInput'
