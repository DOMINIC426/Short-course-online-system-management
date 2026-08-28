import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

export default function PasswordInput({
  id,
  label,
  value = "",
  onChange,
  required = true,
  placeholder = "••••••••",
  showStrength = false,
}) {
  const [visible, setVisible] = useState(false);

  const isMinLengthMet = value.length >= 8;
  const isTyping = value.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>

        {showStrength && isTyping && (
          <span
            className={`text-xs font-medium transition-colors ${
              isMinLengthMet ? "font-semibold text-emerald-600" : "text-slate-500"
            }`}
          >
            {value.length}/8 characters
          </span>
        )}
      </div>

      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
            showStrength && isTyping
              ? isMinLengthMet
                ? "border-emerald-500 focus:ring-emerald-500/20"
                : "border-amber-400 focus:ring-amber-400/20"
              : "border-slate-300 focus:ring-udom-accent"
          } ${showStrength && isMinLengthMet ? "pr-20" : "pr-10"}`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-3">
          {showStrength && isMinLengthMet && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )}

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}