import { Toaster } from "react-hot-toast";

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 90,
        right: 24,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--surface)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          borderRadius: "14px",
          padding: "14px 18px",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 20px 40px rgba(20, 22, 43, 0.15)",
          maxWidth: "380px",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#15803d",
            secondary: "#dcfce7",
          },
          style: {
            background: "var(--surface)",
            color: "var(--ink)",
            borderLeft: "4px solid #15803d",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#b0455f",
            secondary: "#fee2e2",
          },
          style: {
            background: "var(--surface)",
            color: "var(--ink)",
            borderLeft: "4px solid #b0455f",
          },
        },
        loading: {
          iconTheme: {
            primary: "#c8a04b",
            secondary: "#f5e6c3",
          },
          style: {
            background: "var(--surface)",
            color: "var(--ink)",
            borderLeft: "4px solid #c8a04b",
          },
        },
      }}
    />
  );
}

export default ToastProvider;