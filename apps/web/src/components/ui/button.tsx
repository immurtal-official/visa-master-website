"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { buttonStyle, type ButtonSize, type ButtonVariant } from "./button-style";

export interface ButtonProps {
  children?: ReactNode;
  /** Primary appears once per view. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconAfter?: IconName;
  /** Full width — the default inside a sticky bottom bar. */
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  name?: string;
  value?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}

/**
 * The single action control.
 *
 * The label is never truncated and the control has no fixed width: English runs
 * 40–60% longer than the Chinese beside it, and a clipped action is an
 * unreadable action.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconAfter,
  block,
  disabled,
  loading,
  type = "button",
  name,
  value,
  onClick,
  style,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type={type}
      name={name}
      value={value}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{ ...buttonStyle({ variant, size, block, disabled, hovered, pressed }), ...style }}
    >
      {loading ? (
        <Icon name="loader-circle" size={18} style={{ animation: "vm-spin 1s linear infinite" }} />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </button>
  );
}
