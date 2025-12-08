import React, { HTMLProps } from "react";

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: {
  indeterminate?: any;
  color?: string;
} & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`${className} h-4 w-4 rounded-lg accent-[#526279] cursor-pointer`}
      {...rest}
    />
  );
}

export default IndeterminateCheckbox;
