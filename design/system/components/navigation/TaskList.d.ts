export type TaskState = "done" | "progress" | "todo" | "locked" | "problem";
export interface TaskItem {
  id: string;
  title: string;
  state?: TaskState;
  /** Short line under the title, e.g. how long it takes. */
  hint?: React.ReactNode;
  /** For a locked item: the section that unlocks it. Required whenever state is "locked". */
  after?: string;
}
export interface TaskSection {
  id: string;
  title: string;
  description?: React.ReactNode;
  items: TaskItem[];
}
export interface TaskListProps {
  sections: TaskSection[];
  onSelect?: (item: TaskItem, section: TaskSection) => void;
  /** The "you have completed N of M" line. On by default. */
  summary?: boolean;
  style?: React.CSSProperties;
}
export declare function TaskList(props: TaskListProps): JSX.Element;
