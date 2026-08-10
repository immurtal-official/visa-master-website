export interface CardProps {
  children?: React.ReactNode;
  padding?: string;
  /** 0 = border only (default page usage), 1 = resting, 2 = floating. */
  elevation?: 0 | 1 | 2;
  tone?: "default" | "accent" | "sunken" | "inverse";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
