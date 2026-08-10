export interface StepProgressProps {
  section: string;
  step: number;
  total: number;
  sections?: Array<{ name: string; state: "done" | "current" | "todo" }>;
  style?: React.CSSProperties;
}
export declare function StepProgress(props: StepProgressProps): JSX.Element;
