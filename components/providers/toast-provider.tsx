"use client";

import { Check, CircleAlert, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ShowToastOptions = {
  title: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = {
  id: number;
  title: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  show: (options: ShowToastOptions) => void;
  success: (title: string, duration?: number) => void;
  error: (title: string, duration?: number) => void;
  info: (title: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

function getToastStyles(variant: ToastVariant) {
  if (variant === "success") {
    return {
      iconBg: "bg-green-500",
      text: "text-slate-700",
    };
  }

  if (variant === "error") {
    return {
      iconBg: "bg-red-500",
      text: "text-slate-700",
    };
  }

  return {
    iconBg: "bg-blue-500",
    text: "text-slate-700",
  };
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <Check className="h-3 w-3" />;
  }

  if (variant === "error") {
    return <CircleAlert className="h-3 w-3" />;
  }

  return <Info className="h-3 w-3" />;
}

function ToastCard({
  toast,
}: {
  toast: ToastItem;
}) {
  const { iconBg, text } = getToastStyles(toast.variant);

  return (
    <div className="pointer-events-auto rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-md">
      <div className={`flex items-center gap-2 ${text}`}>
        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white ${iconBg}`}>
          <ToastIcon variant={toast.variant} />
        </span>
        <span className="text-sm font-medium">{toast.title}</span>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ title, variant = "info", duration = 2500 }: ShowToastOptions) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, title, variant, duration }]);

    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    show,
    success: (title, duration) => show({ title, duration, variant: "success" }),
    error: (title, duration) => show({ title, duration, variant: "error" }),
    info: (title, duration) => show({ title, duration, variant: "info" }),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-5 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
