import * as z from "zod"
export const contactFormSchema = z.object({
  name: z.string().min(1, "This field is required"),
  surname: z.string().min(1, "This field is required"),
  input_1764927287951: z.email(),
  message: z.string().optional()
});