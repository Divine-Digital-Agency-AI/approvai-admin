"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

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
    const baseStyles =
      "w-full px-4 py-2 bg-background border border-surface/50 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
      : "";

    const inputClasses = `${baseStyles} ${errorStyles} ${className}`;

    const inputElement = isTextarea ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={inputClasses}
        {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={inputClasses}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
    );

    if (label || error || helperText) {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={props.id}
              className="block text-sm font-medium text-foreground mb-2"
            >
              {label}
              {props.required && (
                <span className="text-red-400 ml-1">*</span>
              )}
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
