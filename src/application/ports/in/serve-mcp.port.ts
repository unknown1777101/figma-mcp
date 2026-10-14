export interface IServeMcpUseCase {
  execute(): Promise<void>;
  stop(): Promise<void>;
}
