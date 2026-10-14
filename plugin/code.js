"use strict";
/// <reference types="@figma/plugin-typings" />
// Show UI helper window for WebSocket connection
figma.showUI(__html__, { width: 320, height: 160, title: 'Figma MCP Bridge' });
// Inform the UI of initial metadata
function sendStatusMetadata() {
    figma.ui.postMessage({
        type: 'EVENT',
        action: 'GET_STATUS',
        data: {
            version: '1.0.0',
            documentName: figma.root.name,
            activePageName: figma.currentPage.name,
        },
    });
}
sendStatusMetadata();
// Helper: Parse Hex or RGBA Color
function parseColor(c) {
    if (!c)
        return { r: 0, g: 0, b: 0, a: 1 };
    if (typeof c === 'object' && typeof c.r === 'number') {
        return {
            r: Math.max(0, Math.min(1, c.r)),
            g: Math.max(0, Math.min(1, c.g)),
            b: Math.max(0, Math.min(1, c.b)),
            a: c.a !== undefined ? Math.max(0, Math.min(1, c.a)) : 1,
        };
    }
    if (typeof c === 'string') {
        let hex = c.trim().replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map((char) => char + char).join('');
        }
        if (hex.length === 6) {
            return {
                r: parseInt(hex.slice(0, 2), 16) / 255,
                g: parseInt(hex.slice(2, 4), 16) / 255,
                b: parseInt(hex.slice(4, 6), 16) / 255,
                a: 1,
            };
        }
        if (hex.length === 8) {
            return {
                r: parseInt(hex.slice(0, 2), 16) / 255,
                g: parseInt(hex.slice(2, 4), 16) / 255,
                b: parseInt(hex.slice(4, 6), 16) / 255,
                a: parseInt(hex.slice(6, 8), 16) / 255,
            };
        }
    }
    return { r: 0, g: 0, b: 0, a: 1 };
}
// Helper: Load font safely
async function loadFontSafe(fontFamily = 'Inter', style = 'Regular') {
    const primary = { family: fontFamily, style: style };
    try {
        await figma.loadFontAsync(primary);
        return primary;
    }
    catch {
        try {
            const fallbackInter = { family: 'Inter', style: 'Regular' };
            await figma.loadFontAsync(fallbackInter);
            return fallbackInter;
        }
        catch {
            const fallbackRoboto = { family: 'Roboto', style: 'Regular' };
            await figma.loadFontAsync(fallbackRoboto);
            return fallbackRoboto;
        }
    }
}
// Helper: Apply styles to geometry or frame node
function applyStyles(node, style) {
    if (!style)
        return;
    // Fills
    if (Array.isArray(style.fills)) {
        const paints = [];
        for (const f of style.fills) {
            const parsed = parseColor(f.color);
            paints.push({
                type: 'SOLID',
                color: { r: parsed.r, g: parsed.g, b: parsed.b },
                opacity: f.opacity !== undefined ? f.opacity : parsed.a,
            });
        }
        node.fills = paints;
    }
    // Strokes
    if (Array.isArray(style.strokes) && style.strokes.length > 0) {
        const strokes = [];
        for (const s of style.strokes) {
            const parsed = parseColor(s.color);
            strokes.push({
                type: 'SOLID',
                color: { r: parsed.r, g: parsed.g, b: parsed.b },
                opacity: s.opacity !== undefined ? s.opacity : parsed.a,
            });
        }
        node.strokes = strokes;
        if (typeof style.strokeWeight === 'number') {
            node.strokeWeight = style.strokeWeight;
        }
    }
    // Corner radius
    if (style.cornerRadius !== undefined) {
        if (typeof style.cornerRadius === 'number' && 'cornerRadius' in node) {
            node.cornerRadius = style.cornerRadius;
        }
        else if (Array.isArray(style.cornerRadius) && style.cornerRadius.length === 4) {
            if ('topLeftRadius' in node) {
                node.topLeftRadius = style.cornerRadius[0];
                node.topRightRadius = style.cornerRadius[1];
                node.bottomRightRadius = style.cornerRadius[2];
                node.bottomLeftRadius = style.cornerRadius[3];
            }
        }
    }
    // Opacity
    if (typeof style.opacity === 'number') {
        node.opacity = Math.max(0, Math.min(1, style.opacity));
    }
    // Effects (Drop shadow)
    if (Array.isArray(style.effects) && 'effects' in node) {
        const effects = [];
        for (const eff of style.effects) {
            if (eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') {
                const parsed = parseColor(eff.color || '#00000040');
                effects.push({
                    type: eff.type,
                    color: { r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a },
                    offset: eff.offset || { x: 0, y: 4 },
                    radius: eff.radius || 8,
                    spread: eff.spread || 0,
                    visible: true,
                    blendMode: 'NORMAL',
                });
            }
        }
        node.effects = effects;
    }
    // Clips content
    if (typeof style.clipsContent === 'boolean' && 'clipsContent' in node) {
        node.clipsContent = style.clipsContent;
    }
}
// Helper: Apply Auto-Layout to Frame
function applyAutoLayout(frame, layout) {
    if (!layout)
        return;
    if (layout.layoutMode === 'HORIZONTAL' || layout.layoutMode === 'VERTICAL') {
        frame.layoutMode = layout.layoutMode;
        if (typeof layout.itemSpacing === 'number') {
            frame.itemSpacing = layout.itemSpacing;
        }
        // Padding
        if (typeof layout.padding === 'number') {
            frame.paddingLeft = layout.padding;
            frame.paddingRight = layout.padding;
            frame.paddingTop = layout.padding;
            frame.paddingBottom = layout.padding;
        }
        else if (layout.padding && typeof layout.padding === 'object') {
            if (typeof layout.padding.left === 'number')
                frame.paddingLeft = layout.padding.left;
            if (typeof layout.padding.right === 'number')
                frame.paddingRight = layout.padding.right;
            if (typeof layout.padding.top === 'number')
                frame.paddingTop = layout.padding.top;
            if (typeof layout.padding.bottom === 'number')
                frame.paddingBottom = layout.padding.bottom;
        }
        // Alignment
        if (layout.primaryAxisAlignItems) {
            frame.primaryAxisAlignItems = layout.primaryAxisAlignItems;
        }
        if (layout.counterAxisAlignItems) {
            frame.counterAxisAlignItems = layout.counterAxisAlignItems;
        }
        // Sizing
        if (layout.primaryAxisSizingMode) {
            frame.primaryAxisSizingMode = layout.primaryAxisSizingMode;
        }
        if (layout.counterAxisSizingMode) {
            frame.counterAxisSizingMode = layout.counterAxisSizingMode;
        }
        // Wrapping
        if (layout.layoutWrap) {
            frame.layoutWrap = layout.layoutWrap;
        }
    }
    else if (layout.layoutMode === 'NONE') {
        frame.layoutMode = 'NONE';
    }
}
// Recursive Node Renderer
async function renderNode(spec, parent) {
    if (!spec) {
        throw new Error('renderNode received empty specification');
    }
    const type = (spec.type || 'FRAME').toUpperCase();
    let createdNode;
    if (type === 'TEXT') {
        const textNode = figma.createText();
        const textProps = spec.text || {};
        const typo = textProps.typography || {};
        const fontName = await loadFontSafe(typo.fontFamily || 'Inter', typo.fontWeight || 'Regular');
        textNode.fontName = fontName;
        if (typeof typo.fontSize === 'number') {
            textNode.fontSize = typo.fontSize;
        }
        if (typeof typo.lineHeight === 'number') {
            textNode.lineHeight = { value: typo.lineHeight, unit: 'PIXELS' };
        }
        if (typo.textAlignHorizontal) {
            textNode.textAlignHorizontal = typo.textAlignHorizontal;
        }
        textNode.characters = textProps.content || spec.content || 'Text';
        // Text color fill
        const textColor = textProps.color || spec.color;
        if (textColor) {
            const parsed = parseColor(textColor);
            textNode.fills = [{ type: 'SOLID', color: { r: parsed.r, g: parsed.g, b: parsed.b }, opacity: parsed.a }];
        }
        applyStyles(textNode, spec.style);
        createdNode = textNode;
    }
    else if (type === 'RECTANGLE') {
        const rect = figma.createRectangle();
        rect.resize(spec.width || 100, spec.height || 100);
        applyStyles(rect, spec.style);
        createdNode = rect;
    }
    else if (type === 'ELLIPSE') {
        const ellipse = figma.createEllipse();
        ellipse.resize(spec.width || 100, spec.height || 100);
        applyStyles(ellipse, spec.style);
        createdNode = ellipse;
    }
    else if (type === 'LINE') {
        const line = figma.createLine();
        line.resize(spec.width || 100, 0);
        applyStyles(line, spec.style);
        createdNode = line;
    }
    else if (type === 'BUTTON') {
        // High-level button convenience element (Frame with Auto-Layout + Text)
        const btnFrame = figma.createFrame();
        btnFrame.name = spec.name || 'Button';
        btnFrame.layoutMode = 'HORIZONTAL';
        btnFrame.primaryAxisAlignItems = 'CENTER';
        btnFrame.counterAxisAlignItems = 'CENTER';
        btnFrame.primaryAxisSizingMode = 'AUTO';
        btnFrame.counterAxisSizingMode = 'AUTO';
        btnFrame.paddingLeft = 16;
        btnFrame.paddingRight = 16;
        btnFrame.paddingTop = 10;
        btnFrame.paddingBottom = 10;
        btnFrame.cornerRadius = 8;
        // Default primary button style if none provided
        if (!spec.style || !spec.style.fills) {
            btnFrame.fills = [{ type: 'SOLID', color: { r: 0.14, g: 0.38, b: 0.92 } }]; // #2563EB
        }
        else {
            applyStyles(btnFrame, spec.style);
        }
        applyAutoLayout(btnFrame, spec.layout);
        // Button label
        const labelNode = figma.createText();
        const fontName = await loadFontSafe('Inter', 'Medium');
        labelNode.fontName = fontName;
        labelNode.fontSize = 14;
        labelNode.characters = spec.text?.content || spec.content || 'Button';
        labelNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        btnFrame.appendChild(labelNode);
        createdNode = btnFrame;
    }
    else {
        // Default FRAME or COMPONENT
        const frame = type === 'COMPONENT' ? figma.createComponent() : figma.createFrame();
        frame.name = spec.name || (type === 'COMPONENT' ? 'Component' : 'Frame');
        if (typeof spec.width === 'number' && typeof spec.height === 'number') {
            frame.resize(spec.width, spec.height);
        }
        // Default white fill for top-level frame if none provided
        if (!spec.style || !spec.style.fills) {
            frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        }
        else {
            applyStyles(frame, spec.style);
        }
        applyAutoLayout(frame, spec.layout);
        // Recursively render children
        if (Array.isArray(spec.children)) {
            for (const childSpec of spec.children) {
                await renderNode(childSpec, frame);
            }
        }
        createdNode = frame;
    }
    if (spec.name && createdNode.name !== spec.name) {
        createdNode.name = spec.name;
    }
    // Positioning
    if (typeof spec.x === 'number')
        createdNode.x = spec.x;
    if (typeof spec.y === 'number')
        createdNode.y = spec.y;
    // Append to parent or current page
    if (parent) {
        parent.appendChild(createdNode);
    }
    else {
        figma.currentPage.appendChild(createdNode);
    }
    return createdNode;
}
// Convert UInt8Array to Base64
function uint8ToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Buffer or btoa in QuickJS
    if (typeof btoa === 'function') {
        return btoa(binary);
    }
    // Manual base64 fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < len; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < len ? bytes[i + 1] : 0;
        const b2 = i + 2 < len ? bytes[i + 2] : 0;
        result += chars[b0 >> 2];
        result += chars[((b0 & 3) << 4) | (b1 >> 4)];
        result += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
        result += i + 2 < len ? chars[b2 & 63] : '=';
    }
    return result;
}
// Handle incoming commands from UI (WebSocket relay)
figma.ui.onmessage = async (msg) => {
    if (!msg || !msg.id || !msg.action)
        return;
    const { id, action, payload } = msg;
    try {
        switch (action) {
            case 'PING': {
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: { pong: true, time: Date.now() },
                });
                break;
            }
            case 'GET_STATUS': {
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: {
                        version: '1.0.0',
                        documentName: figma.root.name,
                        activePageName: figma.currentPage.name,
                    },
                });
                break;
            }
            case 'GET_SELECTION': {
                const selection = figma.currentPage.selection.map((node) => ({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    width: node.width,
                    height: node.height,
                    x: node.x,
                    y: node.y,
                    childrenCount: 'children' in node ? node.children.length : 0,
                }));
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: selection,
                });
                break;
            }
            case 'RENDER_LAYOUT': {
                const rootNode = await renderNode(payload);
                // Center view on rendered node and select it
                figma.currentPage.selection = [rootNode];
                figma.viewport.scrollAndZoomIntoView([rootNode]);
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: {
                        nodeId: rootNode.id,
                        name: rootNode.name,
                        type: rootNode.type,
                        width: rootNode.width,
                        height: rootNode.height,
                        childrenCount: 'children' in rootNode ? rootNode.children.length : 0,
                    },
                });
                break;
            }
            case 'CREATE_ELEMENT': {
                const element = await renderNode(payload);
                figma.currentPage.selection = [element];
                figma.viewport.scrollAndZoomIntoView([element]);
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: {
                        nodeId: element.id,
                        name: element.name,
                        type: element.type,
                        width: element.width,
                        height: element.height,
                    },
                });
                break;
            }
            case 'EXPORT_NODE': {
                const targetNode = figma.getNodeById(payload.nodeId);
                if (!targetNode) {
                    throw new Error(`Node with ID ${payload.nodeId} not found`);
                }
                const format = (payload.format || 'PNG').toUpperCase();
                const exportBytes = await targetNode.exportAsync({
                    format: format === 'SVG' ? 'SVG' : 'PNG',
                });
                const base64Data = uint8ToBase64(exportBytes);
                figma.ui.postMessage({
                    id,
                    action,
                    success: true,
                    data: {
                        nodeId: targetNode.id,
                        format,
                        base64: base64Data,
                    },
                });
                break;
            }
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    catch (err) {
        figma.ui.postMessage({
            id,
            action,
            success: false,
            error: err.message || 'Execution error in Figma plugin',
        });
    }
};
