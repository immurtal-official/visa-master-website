export interface DeviceHandoffProps {
  /** "continue" carries the session to another device; "camera" borrows the phone's camera. */
  mode?: "continue" | "camera";
  /** Handoff URL with its one-time token. Shown as a copyable link. */
  url?: string;
  /** Short typed code, the equal path for anyone whose scanner fails. */
  code?: string;
  /** QR image (data URI or blob URL) rendered by the app — it encodes a token the DS cannot mint. */
  qrSrc?: string;
  /** Code lifetime in minutes. Default 15. */
  minutes?: number;
  state?: "waiting" | "connected";
  /** Device name shown once connected, e.g. "iPhone 13". */
  device?: string;
  onCopy?: (url?: string) => void;
  style?: React.CSSProperties;
}
export declare function DeviceHandoff(props: DeviceHandoffProps): JSX.Element;
