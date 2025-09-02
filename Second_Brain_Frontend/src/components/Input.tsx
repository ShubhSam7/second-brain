interface input_ {
  placeholder: string;
  text_input?: string;
  type: string
}

export function Input({ placeholder, text_input, type }: input_) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        className="border rounded-md p-2 m-3"
      >{text_input}</input>
    </div>
  );
}