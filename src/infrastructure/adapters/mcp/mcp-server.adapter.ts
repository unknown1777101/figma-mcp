import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { IMcpTransport } from '../../../application/ports/out/mcp-transport.port.js';
import { IFigmaBridge } from '../../../application/ports/out/bridge.port.js';
import { IRenderUiUseCase } from '../../../application/ports/in/render-ui.port.js';
import { IGetSelectionUseCase } from '../../../application/ports/in/get-selection.port.js';
import { LayoutValidator } from '../../../domain/dsl/layout-validator.js';

export class McpServerAdapter implements IMcpTransport {
  private server: McpServer;
  private transport: StdioServerTransport | null = null;

  constructor(
    private readonly bridge: IFigmaBridge,
    private readonly renderUiUseCase: IRenderUiUseCase,
    private readonly getSelectionUseCase: IGetSelectionUseCase
  ) {
    this.server = new McpServer({
      name: 'figma-mcp',
      version: '1.0.0',
    });

    this.registerTools();
  }

  private registerTools(): void {
    // 1. figma_status
    this.server.tool(
      'figma_status',
      'Check if Figma desktop plugin is connected to the local bridge and retrieve canvas metadata',
      {},
      async () => {
        const status = this.bridge.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }
    );

    // 2. figma_get_selection
    this.server.tool(
      'figma_get_selection',
      'Inspect nodes or layers currently selected by the user in the Figma canvas',
      {},
      async () => {
        try {
          const selection = await this.getSelectionUseCase.execute();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(selection, null, 2),
              },
            ],
          };
        } catch (err: any) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Error getting selection: ${err.message}`,
              },
            ],
          };
        }
      }
    );

    // 3. figma_render_layout (Primary UI Crafting Tool)
    this.server.tool(
      'figma_render_layout',
      'Render a complete UI component or screen into Figma canvas using declarative Auto-Layout JSON tree (DSL). Supports nested frames, buttons, cards, typography, colors, padding, and corner radius.',
      {
        layout: z
          .string()
          .describe(
            'JSON string of the UI tree specification according to LayoutNode schema (type, name, width, height, layout, style, text, children).'
          ),
      },
      async ({ layout }) => {
        try {
          let parsed: unknown;
          try {
            parsed = JSON.parse(layout);
          } catch {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: 'Invalid JSON string provided in layout argument.',
                },
              ],
            };
          }

          const result = await this.renderUiUseCase.execute(parsed);
          return {
            content: [
              {
                type: 'text',
                text: `Successfully rendered UI in Figma!\nNode ID: ${result.nodeId}\nName: ${result.name}\nSize: ${result.width}x${result.height}\nChildren: ${result.childrenCount}`,
              },
            ],
          };
        } catch (err: any) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Render failed: ${err.message}`,
              },
            ],
          };
        }
      }
    );

    // 4. figma_create_element (Primitive helper)
    this.server.tool(
      'figma_create_element',
      'Create a single primitive element in Figma (FRAME, RECTANGLE, TEXT, ELLIPSE, BUTTON)',
      {
        type: z
          .enum(['FRAME', 'RECTANGLE', 'TEXT', 'ELLIPSE', 'BUTTON'])
          .describe('Element type'),
        name: z.string().optional().describe('Element name'),
        width: z.number().optional().describe('Width in pixels'),
        height: z.number().optional().describe('Height in pixels'),
        color: z.string().optional().describe('Hex color string, e.g. #3B82F6'),
        textContent: z.string().optional().describe('Text string if type is TEXT or BUTTON'),
      },
      async (args) => {
        try {
          const nodePayload: any = {
            type: args.type,
            name: args.name || args.type,
            width: args.width || (args.type === 'TEXT' ? undefined : 100),
            height: args.height || (args.type === 'TEXT' ? undefined : 100),
          };

          if (args.color) {
            nodePayload.style = {
              fills: [
                {
                  type: 'SOLID',
                  color: args.color,
                },
              ],
            };
          }

          if (args.type === 'TEXT' || args.textContent) {
            nodePayload.text = {
              content: args.textContent || 'Hello Figma',
            };
          }

          const result = await this.renderUiUseCase.execute(nodePayload);
          return {
            content: [
              {
                type: 'text',
                text: `Element created:\nNode ID: ${result.nodeId}\nName: ${result.name}`,
              },
            ],
          };
        } catch (err: any) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Failed to create element: ${err.message}`,
              },
            ],
          };
        }
      }
    );

    // 5. figma_export_node
    this.server.tool(
      'figma_export_node',
      'Export a Figma node to PNG or SVG format (Base64 encoded string)',
      {
        nodeId: z.string().describe('Figma Node ID to export'),
        format: z.enum(['PNG', 'SVG', 'PDF']).default('PNG').describe('Export format'),
      },
      async ({ nodeId, format }) => {
        try {
          const exportResult = await this.bridge.sendAction<
            { nodeId: string; format: string },
            { base64: string; format: string }
          >('EXPORT_NODE', { nodeId, format });

          return {
            content: [
              {
                type: 'text',
                text: `Node ${nodeId} exported successfully (${format}). Base64 length: ${exportResult.base64.length} chars.`,
              },
            ],
          };
        } catch (err: any) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Failed to export node: ${err.message}`,
              },
            ],
          };
        }
      }
    );
  }

  async start(): Promise<void> {
    this.transport = new StdioServerTransport();
    await this.server.connect(this.transport);
  }

  async stop(): Promise<void> {
    if (this.transport) {
      await this.server.close();
      this.transport = null;
    }
  }
}
