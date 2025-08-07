import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Music prompt is required",
  }),
  duration: z.string().min(1).max(60),
});

export const duration = [
  {
    value: "5",
    label: "5 Seconds",
  },
  {
    value: "10",
    label: "10 Seconds",
  },
  {
    value: "20",
    label: "20 Seconds",
  },
  {
    value: "30",
    label: "30 Seconds",
  },
  {
    value: "60",
    label: "60 Seconds",
  },
];
