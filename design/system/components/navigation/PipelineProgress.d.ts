export type PipelineStage = "sources" | "generate" | "consistency" | "review";
export type PipelineState = "done" | "active" | "pending" | "blocked";
export interface PipelineProgressProps {
  /** Index of the stage in progress, 0-3. */
  current?: number;
  /** Override a stage's derived state, e.g. { review: "blocked" }. */
  states?: Partial<Record<PipelineStage, PipelineState>>;
  /** Per-stage line of plain explanation, e.g. { sources: "已核对 3 个官方来源" }. */
  notes?: Partial<Record<PipelineStage, React.ReactNode>>;
  etaMinutes?: number;
  /** The "you can close this page" reassurance. On by default. */
  leaveNote?: boolean;
  title?: boolean;
  style?: React.CSSProperties;
}
export declare const PIPELINE_STAGES: PipelineStage[];
export declare function PipelineProgress(props: PipelineProgressProps): JSX.Element;
