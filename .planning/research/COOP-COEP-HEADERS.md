# COOP/COEP Headers Investigation

**Project:** WebContainer Demo
**Researched:** 2026-04-15
**Confidence:** HIGH (verified via @webcontainer/api source code and README)

## Current Configuration

vite.config.js currently sets:
```javascript
server: {
  headers: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
},
```

## What Headers WebContainer Actually Requires

**Required headers for WebContainer to function:**
- `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- `Cross-Origin-Opener-Policy: same-origin` (COOP)

These headers enable cross-origin isolation, which is required for `SharedArrayBuffer` - a critical dependency of WebContainer.

**Source:** [@webcontainer/api README.md](file:///D:/Develop/webC/node_modules/@webcontainer/api/README.md)

## crossOriginIsolated Verification

The WebContainer API internally checks:
```javascript
if (window.crossOriginIsolated && options.coep === 'none') {
    console.warn(`A Cross-Origin-Embedder-Policy header is required...`);
}
```

**How to verify in browser console:**
```javascript
self.crossOriginIsolated  // Should return true
```

**Current state:** Layout.jsx does NOT check `crossOriginIsolated` before calling `WebContainer.boot()`. The boot happens automatically on mount via `startRuntime()`.

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | Full | Works with COOP/COEP headers |
| Firefox | Full | Works with COOP/COEP headers |
| Safari | Limited | May not work due to SharedArrayBuffer limitations |

## Alternative: coep Option

WebContainer.boot() accepts a `coep` option:
```typescript
coep?: 'require-corp' | 'credentialless' | 'none';
```

- `'require-corp'` - Default, requires COEP header (what we have now)
- `'credentialless'` - Uses credentialless policy (newer, more permissive)
- `'none'` - No cross-origin isolation (Chromium only with Origin Trial)

**Note:** The `coep` value is fixed on first boot and cannot change on subsequent boots.

## Recommendations

1. **Current headers are correct** - `require-corp` + `same-origin` is the official requirement
2. **Add crossOriginIsolated check** - Consider adding a guard before booting:
   ```javascript
   if (!self.crossOriginIsolated) {
     console.error('Cross-origin isolation required for WebContainer');
     // Show user-friendly error
   }
   ```
3. **Consider credentialless** - `'credentialless'` is a newer option that may have better compatibility while still enabling SharedArrayBuffer

## Sources

- [@webcontainer/api README.md](file:///D:/Develop/webC/node_modules/@webcontainer/api/README.md) - Official header requirements
- [@webcontainer/api/dist/index.d.ts](file:///D:/Develop/webC/node_modules/@webcontainer/api/dist/index.d.ts) - coep option types
- [@webcontainer/api/dist/index.js](file:///D:/Develop/webC/node_modules/@webcontainer/api/dist/index.js) - Internal crossOriginIsolated check
