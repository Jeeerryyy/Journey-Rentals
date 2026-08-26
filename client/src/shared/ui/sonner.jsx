import React from "react"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "#FFFFFF",
          color: "#212121",
          border: "1px solid #DFDCE8",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
          borderRadius: "1rem",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#212121] group-[.toaster]:border-[#DFDCE8] group-[.toaster]:shadow-xl font-body font-semibold text-xs rounded-2xl",
          description: "group-[.toast]:text-[#6F6E73]",
          actionButton:
            "group-[.toast]:bg-[#212121] group-[.toast]:text-white rounded-full font-bold",
          cancelButton:
            "group-[.toast]:bg-[#F6F5FA] group-[.toast]:text-[#212121] rounded-full font-bold",
          closeButton:
            "group-[.toast]:bg-[#F6F5FA] group-[.toast]:text-[#212121] group-[.toast]:border-[#DFDCE8]",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast }
