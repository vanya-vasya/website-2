interface ContactFormData {
  name: string;
  email: string;
  message: string;
  captchaToken: string;
}

export const sendContactForm = async (data: ContactFormData) => {
  const response = await fetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};
