export interface UploadFile {
  name: string;
  size?: string;
  progress?: number;
  state?: "uploading" | "failed" | "done";
}
export interface ResumableUploaderProps {
  files?: UploadFile[];
  onPick?: () => void;
  onRetry?: (name: string) => void;
  hint?: string;
  style?: React.CSSProperties;
}
export declare function ResumableUploader(props: ResumableUploaderProps): JSX.Element;
