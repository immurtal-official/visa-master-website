export interface SheetProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  /** Force a presentation. Default follows the viewport. */
  mode?: "sheet" | "dialog";
}
export declare function Sheet(props: SheetProps): JSX.Element | null;
