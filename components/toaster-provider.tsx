"use client";

import { Toaster } from "react-hot-toast"

export const ToasterProvider = () => {
  return <Toaster toastOptions={{
    duration: 3000 
  }}/>
};