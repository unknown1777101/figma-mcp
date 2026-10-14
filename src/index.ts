// Domain exports
export * from './domain/models/element.js';
export * from './domain/models/bridge-protocol.js';
export * from './domain/errors/domain-errors.js';
export * from './domain/dsl/layout-validator.js';

// Application ports & use cases
export * from './application/ports/in/start-bridge.port.js';
export * from './application/ports/in/serve-mcp.port.js';
export * from './application/ports/in/render-ui.port.js';
export * from './application/ports/in/get-selection.port.js';
export * from './application/ports/in/manage-config.port.js';
export * from './application/ports/in/export-plugin.port.js';

export * from './application/ports/out/bridge.port.js';
export * from './application/ports/out/crypto.port.js';
export * from './application/ports/out/config.port.js';
export * from './application/ports/out/mcp-transport.port.js';
export * from './application/ports/out/plugin-packager.port.js';

export * from './application/use-cases/start-bridge.use-case.js';
export * from './application/use-cases/serve-mcp.use-case.js';
export * from './application/use-cases/render-ui.use-case.js';
export * from './application/use-cases/get-selection.use-case.js';
export * from './application/use-cases/manage-config.use-case.js';
export * from './application/use-cases/export-plugin.use-case.js';

// Infrastructure adapters
export * from './infrastructure/adapters/crypto/aes-crypto.service.js';
export * from './infrastructure/adapters/config/file-config.repository.js';
export * from './infrastructure/adapters/bridge/websocket-bridge.adapter.js';
export * from './infrastructure/adapters/mcp/mcp-server.adapter.js';
export * from './infrastructure/adapters/plugin/plugin-packager.adapter.js';

// Presentation
export * from './presentation/cli/program.js';
