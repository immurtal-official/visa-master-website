export interface PackFile {
  name: string;
  badge?: string;
  badgeTone?: "neutral" | "info" | "success" | "warning" | "error";
  /** Why this file is in the pack. */
  purpose?: string;
  instructions?: string[];
  print?: string;
  pages?: number;
  updated?: string;
}
export interface FilePreviewProps {
  file?: PackFile;
  style?: React.CSSProperties;
}
export declare function FilePreview(props: FilePreviewProps): JSX.Element | null;
