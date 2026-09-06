"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-48 rounded-xl border border-slate-700/50 bg-slate-900/95 shadow-lg backdrop-blur-xl z-40 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: string;
  label: string;
  onClick: () => void;
  isDangerous?: boolean;
  disabled?: boolean;
}

export function DropdownItem({
  icon,
  label,
  onClick,
  isDangerous = false,
  disabled = false,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-3 ${
        disabled
          ? "text-slate-600 cursor-not-allowed"
          : isDangerous
            ? "text-red-300 hover:bg-red-500/20"
            : "text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-slate-700/50" />;
}

interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterBadge({ label, value, onRemove }: FilterBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-sm text-violet-200">
      <span>
        <strong>{label}:</strong> {value}
      </span>
      <button
        onClick={onRemove}
        className="text-violet-300 hover:text-violet-100 font-bold"
      >
        ✕
      </button>
    </div>
  );
}
