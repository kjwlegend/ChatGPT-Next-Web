import * as React from "react";
import styles from "./input-range.module.scss";

interface InputRangeProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  title?: string;
  value: number | string;
  className?: string;
  min: number | string;
  max: number | string;
  step: number | string;
}

export function InputRange({
  onChange,
  title,
  value,
  className,
  min,
  max,
  step,
}: InputRangeProps) {
  return (
    <div className={styles["input-range"] + ` ${className ?? ""}`}>
      {title || value}
      <input
        type="range"
        title={title}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      ></input>
    </div>
  );
}
