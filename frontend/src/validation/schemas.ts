// ---------------------------------------------------------------
// Form rules (Zod). They match the checks in the API's DTOs, so the
// customer sees a problem before the request is sent.
// ---------------------------------------------------------------
import { z } from "zod";

const email = z.string().trim().pipe(z.email("Please enter a valid email address."));
const password = z.string().min(6, "Password must be at least 6 characters.");

export const loginSchema = z.object({ email, password });
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name."),
    email,
    password,
    confirmPassword: z.string(),
    agreed: z.boolean().refine((value) => value, "Please accept the terms to continue."),
  })
  .refine((form) => form.confirmPassword === form.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name."),
  email,
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  address: z.string().trim().min(10, "Please enter your full delivery address."),
  city: z.string().trim().min(1, "Please enter your city."),
  state: z.string().min(1, "Please choose your state."),
  pinCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const newsletterSchema = z.object({ email });
export type NewsletterValues = z.infer<typeof newsletterSchema>;
