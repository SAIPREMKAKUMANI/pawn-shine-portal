import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// This code represents the **boilerplate for a reusable, accessible Form component** built on top of *React Hook Form* and *Radix UI*. It is commonly found in projects using the *shadcn/ui* library. 

// Instead of managing state and accessibility (like ARIA labels and IDs) manually for every single input, this file creates a system where sub-components communicate automatically.

// ### Core Components Explained:

// *   **`Form`**: This is just a wrapper for `FormProvider` from *React Hook Form*. It allows all child form components to access form data without needing to pass props manually.

// *   **`FormField`**: The primary wrapper for an individual input. It uses `FormFieldContext` to "remember" which field name it is currently handling, making it easier for child components like labels and error messages to know which field they belong to.

// *   **`FormItem`**: A wrapper (`div`) that creates a unique ID using `React.useId()`. This ID is shared via `FormItemContext` so that the label, input, description, and error message all link back to the same parent container.

// *   **`useFormField` (The "Glue")**: This is an internal helper hook. It looks up the field name (from `FormField`) and the unique ID (from `FormItem`). It returns everything a component needs: the current error state, the ID for accessibility tags (`aria-describedby`), and the field name.

// *   **`FormLabel`**: Automatically links to the input using the `htmlFor` attribute derived from the unique ID. It also detects if there is an error and changes its color to "destructive" (red) accordingly.

// *   **`FormControl`**: This renders your actual input (like a `<input>` or `<textarea>`). It uses *Radix UI's Slot* to take whatever component you pass it and inject necessary accessibility attributes like `aria-invalid` and `aria-describedby` (which tells screen readers to read the error message if one exists).

// *   **`FormDescription`**: A simple helper to render helper text. It automatically links itself to the input via accessibility IDs so screen readers associate the description with the specific field.

// *   **`FormMessage`**: This logic is smart. If there is a validation error in the form, it automatically displays the error message. If there is no error, it renders whatever `children` you passed, or returns `null` if empty.

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
