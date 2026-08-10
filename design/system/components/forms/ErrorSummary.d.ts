export interface ErrorSummaryProps {
  title?: string;
  /** field is the id of the input the message links to. */
  errors: Array<{ field: string; message: string }>;
  onJump?: (field: string) => void;
}
export declare function ErrorSummary(props: ErrorSummaryProps): JSX.Element | null;
