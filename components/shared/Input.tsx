"use client";

import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useState,
} from "react";
import { Eye, EyeOff } from "lucide-react";

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseInputProps {}

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {
  as?: "textarea";
}

type CombinedInputProps = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, CombinedInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const isTextarea = "as" in props && props.as === "textarea";
    const isPassword =
      !isTextarea && (props as InputHTMLAttributes<HTMLInputElement>).type === "password";
    const [revealed, setRevealed] = useState(false);

    const baseStyles =
      "w-full px-4 py-2 bg-background border border-surface/50 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
      : "";

    const inputClasses = `${baseStyles} ${errorStyles} ${className} ${
      isPassword ? "pr-11" : ""
    }`;

    const inputElement = isTextarea ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={inputClasses}
        {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <div className={isPassword ? "relative" : undefined}>
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={inputClasses}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
          type={
            isPassword
              ? revealed
                ? "text"
                : "password"
              : (props as InputHTMLAttributes<HTMLInputElement>).type
          }
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-[#666666] transition-colors hover:bg-[#f0f0f0] hover:text-[#1a1a1a] dark:text-[#7f7f7f] dark:hover:bg-[#262626] dark:hover:text-white"
            aria-label={revealed ? "Hide password" : "Show password"}
            title={revealed ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
    );

    if (label || error || helperText) {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={props.id}
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {label}
              {props.required && <span className="ml-1 text-red-400">*</span>}
            </label>
          )}
          {inputElement}
          {error && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-foreground/60">{helperText}</p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";

export default Input;
