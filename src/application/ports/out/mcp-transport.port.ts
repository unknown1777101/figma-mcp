export interface IMcpTransport {
  start(): Promise<void>;
  stop(): Promise<void>;
}
