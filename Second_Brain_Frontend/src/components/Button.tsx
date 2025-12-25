import type { ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: (e?: any) => void | Promise<void>;
  full?: boolean;
  padding?: string;
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-accent-primary text-background-primary hover:bg-accent-primary/90 hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] disabled:bg-text-muted disabled:cursor-not-allowed disabled:shadow-none",
  secondary: "bg-surface text-text-primary border border-border-muted hover:border-accent-primary hover:text-accent-primary disabled:opacity-50 disabled:cursor-not-allowed",
};

const defaultStyle = "rounded-lg flex items-center font-medium transition-all duration-300";

const sizeStyle = {
  sm: "py-1.5 px-3 text-sm",
  md: "py-2.5 px-5 text-base",
  lg: "py-3.5 px-7 text-lg",
};

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${variantStyles[props.variant]} ${defaultStyle} ${
        sizeStyle[props.size]
      } ${props.full ? " w-full flex justify-center items-center" : ""} ${props.padding || ""}`}
    >
      {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null}
      {props.text}
      {props.endIcon ? <div className="pl-2">{props.endIcon}</div> : null}
    </button>
  );
};
