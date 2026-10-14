# figma-mcp

> Hexagonal CLI and Model Context Protocol (MCP) server for crafting and rendering UI components in Figma canvas in realtime.

---

## Architecture Overview

`figma-mcp` is designed using strict **Hexagonal Architecture (Ports and Adapters)**:

```
+-------------------------------------------------------------------------+
|                               figma-mcp                                 |
|                                                                         |
|  [Presentation Layer]                                                   |
|    • CLI Commands (bridge, serve, render, auth, plugin, config, status)  |
|    • Two-Tier Parameter Help System & Interactive Wizards               |
|                                                                         |
|  [Application Layer]                                                    |
|    • Inbound Ports: IStartBridge, IServeMcp, IRenderUi, IGetSelection   |
|    • Use Cases: RenderUi, StartBridge, ServeMcp, ManageConfig           |
|    • Outbound Ports: IFigmaBridge, IMcpTransport, ICryptoService        |
|                                                                         |
|  [Domain Layer] (Zero External Dependencies)                            |
|    • Models: LayoutNode, AutoLayout, ElementType, StyleProps, Color     |
|    • DSL & LayoutValidator                                              |
|    • Explicit Domain Errors (BridgeConnectionError, ValidationError)    |
|                                                                         |
|  [Infrastructure Layer (Adapters)]                                      |
|    • WebSocket Bridge Server (ws://localhost:9099)                     |
|    • MCP Server (Stdio Transport via @modelcontextprotocol/sdk)         |
|    • AES-256-GCM Secure Credential Vault (Machine-bound Scrypt key)     |
|    • Figma Plugin Packager & Exporter                                   |
+-------------------------------------------------------------------------+
                                    |
                         WebSocket  |  Figma SceneGraph API
                                    v
                 +--------------------------------------+
                 |      Figma Desktop Plugin Client     |
                 |  (manifest.json, code.js, ui.html)   |
                 +--------------------------------------+
                                    |
                                    v
                         [ Figma Canvas Canvas ]
```

---

## Quickstart

### 1. Build and Test
```bash
npm install
npm run build
npm test
```

### 2. Export Figma Plugin
Export the bundled plugin files to any directory:
```bash
node bin/figma-mcp.js plugin export ./my-figma-plugin
```

### 3. Load Plugin in Figma Desktop
1. Open **Figma Desktop**.
2. Go to **Plugins** -> **Development** -> **Import plugin from manifest...**.
3. Select `manifest.json` inside `./my-figma-plugin`.
4. Run the plugin. The status window will show connection to `ws://localhost:9099`.

### 4. Start the Bridge Server
```bash
node bin/figma-mcp.js bridge
```
Once started, the Figma plugin popup will turn green (**Connected**).

---

## Connecting with AI Agents (Hermes / Claude Desktop)

To connect AI assistants to your Figma canvas, register `figma-mcp` in your MCP client configuration:

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["C:/Users/anzar/Documents/figma-mcp/bin/figma-mcp.js", "serve"]
    }
  }
}
```

### Hermes Agent (`config.yaml`)
```yaml
mcp_servers:
  figma:
    command: "node"
    args:
      - "C:/Users/anzar/Documents/figma-mcp/bin/figma-mcp.js"
      - "serve"
```

---

## MCP Tools Exposed

| Tool | Description |
| :--- | :--- |
| `figma_status` | Check bridge health, Figma document name, and active page. |
| `figma_get_selection` | Inspect the layers/nodes currently selected by the user in Figma. |
| `figma_render_layout` | **Primary UI tool:** Takes a declarative UI tree JSON (Auto-Layout, typography, colors, padding, nested elements) and creates it directly in Figma canvas. |
| `figma_create_element` | Quick primitive helper (Frame, Text, Rectangle, Button). |
| `figma_export_node` | Render and export a Figma node as Base64 PNG or SVG. |

---

## CLI Command Reference

### Root Help
```bash
$ figma-mcp
```
Displays the global directory with all commands, fully exposed parameters, and concrete examples.

### Bridge Commands
```bash
# Start WebSocket bridge server on default port 9099
$ figma-mcp bridge

# Start WebSocket bridge on custom port
$ figma-mcp bridge --port 9099
```

### Direct UI Rendering from CLI
```bash
# Render a JSON UI specification file into Figma
$ figma-mcp render ./examples/card.json

# Render from stdin
$ cat ./examples/card.json | figma-mcp render -
```

### Credential & Security Commands
```bash
# Save Figma Personal Access Token with AES-256-GCM encryption
$ figma-mcp auth set-token

# Save token with a named alias (for multiple accounts)
$ figma-mcp auth set-token figd_token123 WORK

# Check stored credentials (tokens are safely masked)
$ figma-mcp auth status

# Unset token
$ figma-mcp auth unset-token WORK
```

### Configuration & Localization
```bash
# Switch CLI language to Indonesian
$ figma-mcp config set-lang id

# Switch CLI language to English
$ figma-mcp config set-lang en

# View system and connection status
$ figma-mcp status
```

---

## Declarative UI Tree Schema (DSL)

`figma_render_layout` accepts a JSON object structured as follows:

```json
{
  "type": "FRAME",
  "name": "UserProfileCard",
  "width": 320,
  "layout": {
    "layoutMode": "VERTICAL",
    "padding": 20,
    "itemSpacing": 12,
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "CENTER"
  },
  "style": {
    "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
    "cornerRadius": 16,
    "effects": [
      {
        "type": "DROP_SHADOW",
        "color": "#00000014",
        "offset": { "x": 0, "y": 4 },
        "radius": 16
      }
    ]
  },
  "children": [
    {
      "type": "TEXT",
      "name": "UserName",
      "text": {
        "content": "Anzar",
        "color": "#0F172A",
        "typography": {
          "fontFamily": "Inter",
          "fontWeight": "Bold",
          "fontSize": 18
        }
      }
    },
    {
      "type": "BUTTON",
      "name": "ProfileButton",
      "content": "View Details"
    }
  ]
}
```

---

## Author & License

- **Author:** anzar
- **License:** UNLICENSED
