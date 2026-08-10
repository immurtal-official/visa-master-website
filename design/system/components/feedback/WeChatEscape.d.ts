export interface WeChatEscapeProps {
  open?: boolean;
  /** Which dead end the user hit. Both are dead inside the WeChat webview. */
  reason?: "payment" | "download" | "alipay";
  /** The handoff URL, including the one-time auth token, so the browser lands signed in. */
  url?: string;
  /** Lifetime of that token, stated to the user. Default 30. */
  tokenMinutes?: number;
  onCopy?: (url?: string) => void;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function WeChatEscape(props: WeChatEscapeProps): JSX.Element | null;
/** True inside the WeChat webview. Pass a UA string to test. */
export declare function isWeChat(ua?: string): boolean;
