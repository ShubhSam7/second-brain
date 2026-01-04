interface InputProps {
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Input({
  placeholder,
  type,
  value,
  onChange,
  required,
  className,
  disabled,
}: InputProps) {
  return (
    <div className="mb-4">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-background-secondary border border-border-muted rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          className || ""
        }`}
      />
    </div>
  );
}
