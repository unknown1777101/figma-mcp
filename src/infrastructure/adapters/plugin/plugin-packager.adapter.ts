import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IPluginPackager,
  ExportPluginOptions
} from '../../../application/ports/out/plugin-packager.port.js';

export class PluginPackagerAdapter implements IPluginPackager {
  private getPluginSourceDir(): string {
    const currentFile = fileURLToPath(import.meta.url);
    // When running from src/infrastructure/adapters/plugin/... -> project root is 4 levels up
    // Or check if plugin/ exists in cwd or relative to root
    const candidates = [
      path.resolve(path.dirname(currentFile), '../../../../plugin'),
      path.resolve(process.cwd(), 'plugin'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c) && fs.existsSync(path.join(c, 'manifest.json'))) {
        return c;
      }
    }

    return path.resolve(process.cwd(), 'plugin');
  }

  async getPluginInfo(): Promise<{ manifestPath: string; name: string; version: string; defaultPort: number }> {
    const sourceDir = this.getPluginSourceDir();
    const manifestPath = path.join(sourceDir, 'manifest.json');

    let name = 'figma-mcp-bridge';
    let version = '1.0.0';

    if (fs.existsSync(manifestPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (parsed.name) name = parsed.name;
        if (parsed.version) version = parsed.version;
      } catch {}
    }

    return {
      manifestPath,
      name,
      version,
      defaultPort: 9099,
    };
  }

  async exportPlugin(options: ExportPluginOptions): Promise<{ destination: string; files: string[] }> {
    const sourceDir = this.getPluginSourceDir();
    const dest = path.resolve(options.destinationDir);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const filesToCopy = ['manifest.json', 'code.js', 'ui.html'];
    const exportedFiles: string[] = [];

    for (const file of filesToCopy) {
      const srcFile = path.join(sourceDir, file);
      const destFile = path.join(dest, file);

      if (fs.existsSync(srcFile)) {
        let content = fs.readFileSync(srcFile, 'utf8');

        // If port specified and file is ui.html, substitute default port
        if (options.bridgePort && file === 'ui.html') {
          content = content.replace(/ws:\/\/localhost:\d+/g, `ws://localhost:${options.bridgePort}`);
        }

        fs.writeFileSync(destFile, content, 'utf8');
        exportedFiles.push(file);
      }
    }

    return {
      destination: dest,
      files: exportedFiles,
    };
  }
}
