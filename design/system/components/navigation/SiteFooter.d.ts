export interface SiteFooterProps {
  columns?: Array<{ title: string; links: string[] }>;
  note?: React.ReactNode;
  /** Mainland ICP record number. */
  record?: React.ReactNode;
  /** A <LanguageSwitcher placement="footer">. Present on every surface, both breakpoints. */
  language?: React.ReactNode;
}
export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
