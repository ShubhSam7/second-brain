import type { ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  full?: boolean;
  padding?: string;
}

const variantStyles = {
  primary: "bg-purple-600 text-white hover:bg-purple-700 ",
  secondary: "bg-purple-300 text-purple-600 hover:bg-purple-500",
};

const defaultStyle = "rounded-md flex items-center";

const sizeStyle = {
  sm: "py-1 px-2 ",
  md: "py-2 px-4",
  lg: "py-3 px-6",
};

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      className={`${variantStyles[props.variant]} ${defaultStyle} ${
        sizeStyle[props.size]
      }  ${props.full ? " w-full flex justify-center items-center" : ""} ${props.padding}`}
    >
      {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null}
      {props.text}
      {props.endIcon ? <div className="pr-2">{props.endIcon}</div> : null}
    </button>
  );
};
