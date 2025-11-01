import * as z from "zod";
import { FieldError, UseFormRegister } from "react-hook-form";

export type FormData = {
  name: string;
  email: string;
  message: string;
};

export const formSchema = z.object({
    name: z.string().min(1, {
        message: "Email is required."
    }),
    email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
    message: z.string().min(1, {
    message: "Message is required."
  }),
});


export type FormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidFieldNames;
  icon: string;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

export type ValidFieldNames =
| "name"
| "email"
| "message";