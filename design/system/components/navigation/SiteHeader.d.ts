export interface SiteHeaderProps {
  nav?: Array<{ label: string; href?: string }>;
  action?: React.ReactNode;
  /** A <LanguageSwitcher placement="header">. Desktop only — on compact it goes inside the collapsed nav. */
  language?: React.ReactNode;
  /** Below 900px. Collapses nav to a 44px menu button. */
  compact?: boolean;
  onMenu?: () => void;
  style?: React.CSSProperties;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
export interface WordmarkProps {
  size?: number;
  tone?: "default" | "inverse";
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
