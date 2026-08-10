export interface QuestionProps {
  /** Written as a full sentence, not a field label. */
  question: React.ReactNode;
  /** The explanation. Always inline, never a tooltip. */
  hint?: React.ReactNode;
  error?: React.ReactNode;
  legend?: React.ReactNode;
  footnote?: React.ReactNode;
  /** h1 on a real intake page; h2 inside a card demo. */
  as?: "h1" | "h2";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Question(props: QuestionProps): JSX.Element;
