export interface IconProps {
  /** Lucide icon name, kebab-case, e.g. "circle-check". */
  name: string;
  /** Pixel box. 16 inline, 18 in buttons, 20-24 standalone. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible name. Omit for decorative glyphs — they are hidden from AT. */
  title?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
