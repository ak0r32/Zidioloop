"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-300">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
        {description && (
          <span className="text-xs text-slate-500">{description}</span>
        )}
      </div>
      <div className="relative group">{children}</div>
      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export function TextInput({ icon, className, ...props }: TextInputProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur px-4 py-3 ${
            icon ? "pl-11" : ""
          } text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 ${className}`}
        />
      </div>
    </div>
  );
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
      <textarea
        {...props}
        className={`relative w-full rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 resize-vertical ${className}`}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
      <select
        {...props}
        className={`relative w-full rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer ${className}`}
      >
        {children}
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        ▼
      </span>
    </div>
  );
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20",
    secondary:
      "bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600",
    danger:
      "bg-red-600/90 text-white hover:bg-red-500 border border-red-500/50",
    outline:
      "border-2 border-violet-500/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="inline-block animate-spin">⟳</span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  children: ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  const variantClasses = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-green-500/20 text-green-300 border border-green-500/30",
    danger: "bg-red-500/20 text-red-300 border border-red-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
