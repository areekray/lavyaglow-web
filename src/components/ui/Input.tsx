import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-group__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`form-group__input ${error ? 'form-group__input--error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="form-group__error">{error}</span>
      )}
      {hint && !error && (
        <span className="form-group__hint">{hint}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;