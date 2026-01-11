import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  )
)
Form.displayName = "Form"

export { Form }
