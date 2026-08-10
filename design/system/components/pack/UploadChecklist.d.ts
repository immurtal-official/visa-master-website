export interface ChecklistItem {
  id: string;
  title: string;
  /** One plain sentence saying why this document is needed. */
  rationale: string;
  state: "done" | "checking" | "todo" | "redo" | "optional";
  detail?: string;
  files?: string[];
}
export interface UploadChecklistProps {
  items: ChecklistItem[];
  onAction?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function UploadChecklist(props: UploadChecklistProps): JSX.Element;
