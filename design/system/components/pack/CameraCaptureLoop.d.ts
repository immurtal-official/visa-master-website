export interface CapturedPage { id: string; thumb?: string }
export interface CameraCaptureLoopProps {
  pages: CapturedPage[];
  onCapture?: () => void;
  onRemove?: (id: string) => void;
  /** dir is -1 or 1. */
  onMove?: (index: number, dir: number) => void;
  guide?: string;
  /** Template with {n}. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function CameraCaptureLoop(props: CameraCaptureLoopProps): JSX.Element;
