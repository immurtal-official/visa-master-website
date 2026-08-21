import type { CSSProperties } from "react";

/**
 * A Lucide glyph, masked and filled with `currentColor` so it always matches
 * the text beside it.
 *
 * The SVGs are self-hosted under `public/icons/`: nothing in this product loads
 * from a third-party origin, because unpkg and jsDelivr are unreliable or
 * blocked on mainland networks and a hanging icon request delays first paint.
 *
 * No icon carries meaning on its own — every one is paired with text. `title`
 * is only for the rare glyph that is the whole label; without it the span is
 * hidden from assistive technology.
 */
export type IconName =
  | "arrow-right"
  | "check"
  | "circle-alert"
  | "globe"
  | "languages"
  | "loader-circle"
  | "mail"
  | "menu"
  | "x";

export interface IconProps {
  name: IconName;
  /** 16 inline in text, 18 inside buttons, 20–24 standalone. */
  size?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, title, className, style }: IconProps) {
  const mask = `url("/icons/${name}.svg")`;
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{
        display: "inline-block",
        flex: "none",
        inlineSize: size,
        blockSize: size,
        backgroundColor: "currentColor",
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}
