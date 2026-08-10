export interface ConsistencyItem {
  id: string;
  /** The fact being compared, e.g. 在职起始日期. */
  field: string;
  severity: "conflict" | "check" | "pass";
  readings: Array<{ source: string; value: string }>;
  /** What to do, phrased as an instruction. */
  action?: string;
}
export interface ConsistencyReportProps {
  items: ConsistencyItem[];
  summary?: React.ReactNode;
  onResolve?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function ConsistencyReport(props: ConsistencyReportProps): JSX.Element;
