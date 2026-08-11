"use client";

import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { buttonStyle, type ButtonSize, type ButtonVariant } from "./button-style";
import { Link } from "@/i18n/navigation";

export interface LinkButtonProps {
  href: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconAfter?: IconName;
  block?: boolean;
}

/**
 * A link that leads somewhere and looks like a button.
 *
 * It is an anchor, not a button inside one: nesting them is invalid markup, the
 * click lands on the inner button and navigation never happens, and assistive
 * technology is told the control is two things at once.
 */
export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  iconAfter,
  block,
}: LinkButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={buttonStyle({ variant, size, block, hovered, pressed })}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </Link>
  );
}
