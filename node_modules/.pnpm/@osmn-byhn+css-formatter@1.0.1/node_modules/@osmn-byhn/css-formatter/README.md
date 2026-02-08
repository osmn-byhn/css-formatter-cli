# CSS Inliner

> **Bidirectional CSS-HTML converter with smart selector generation**

Convert between CSS and inline styles effortlessly. Perfect for email templates, production optimization, and development workflows.

[![npm version](https://img.shields.io/npm/v/@osmn-byhn/css-formatter.svg)](https://www.npmjs.com/package/@osmn-byhn/css-formatter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Features

### Forward Conversion (CSS → Inline)
- ✅ **Full CSS selector support** - element, class, descendant, compound selectors
- ✅ **Preserve responsive styles** - `@media`, `@import`, `@keyframes`, `@font-face`
- ✅ **Keep pseudo-classes** - `:hover`, `:focus`, `:active` in `<style>` tags
- ✅ **Smart style merging** - respects CSS specificity and existing inline styles

### Reverse Conversion (Inline → CSS)
- ✅ **Smart selector generation** - uses existing classes, creates nested selectors
- ✅ **Style deduplication** - groups identical styles under combined selectors
- ✅ **Minimal HTML changes** - prioritizes existing structure over auto-classes
- ✅ **Two output modes** - internal `<style>` tag or external CSS file

## 📦 Installation

```bash
npm install css-inliner
# or
pnpm add css-inliner
# or
yarn add css-inliner
```

## 🎯 Quick Start

### Forward: CSS to Inline Styles

```typescript
import { inlineCSS } from 'css-inliner';

const html = `
<style>
  .header { color: blue; font-size: 24px; }
  .header:hover { color: darkblue; }
</style>
<div class="header">Hello World</div>
`;

const result = await inlineCSS(html);
console.log(result);
// Output:
// <style>.header:hover { color: darkblue; }</style>
// <div class="header" style="color:blue;font-size:24px">Hello World</div>
```

### Reverse: Inline Styles to CSS (Internal)

```typescript
import { reverseCSSInternal } from 'css-inliner';

const html = `
<div class="header" style="color:blue;font-size:24px">Hello</div>
<div class="header" style="color:blue;font-size:24px">World</div>
`;

const result = await reverseCSSInternal(html);
console.log(result);
// Output:
// <style>
// .header { color:blue; font-size:24px; }
// </style>
// <div class="header">Hello</div>
// <div class="header">World</div>
```

### Reverse: Inline Styles to External CSS

```typescript
import { reverseCSSExternal } from 'css-inliner';
import { writeFileSync } from 'fs';

const html = `
<div class="nav" style="display:flex;gap:20px">Navigation</div>
`;

const { html: htmlOutput, css: cssOutput } = await reverseCSSExternal(html);

writeFileSync('index.html', htmlOutput);
writeFileSync('styles.css', cssOutput);

// index.html:
// <link rel="stylesheet" href="styles.css">
// <div class="nav">Navigation</div>

// styles.css:
// .nav { display:flex; gap:20px; }
```

## 📚 API Reference

### `inlineCSS(input: string): Promise<string>`

Converts CSS rules to inline styles.

**Parameters:**
- `input` - HTML string or URL

**Returns:** HTML string with inlined CSS

**Features:**
- Inlines all CSS rules into element `style` attributes
- Preserves `@media`, `@import`, `@keyframes`, `@font-face` in `<style>` tag
- Keeps pseudo-classes (`:hover`, `:focus`) in `<style>` tag
- Respects CSS specificity
- Merges with existing inline styles

---

### `reverseCSSInternal(input: string): Promise<string>`

Extracts inline styles to internal CSS (`<style>` tag).

**Parameters:**
- `input` - HTML string or URL

**Returns:** HTML string with CSS in `<style>` tag

**Smart Selector Strategy:**
1. **Use existing classes** - `.header`, `.nav-list`
2. **Create nested selectors** - `.parent .child`, `.nav a`
3. **Use element selectors** - `body`, `html`, `h1`
4. **Auto-generate only when needed** - `.auto-style-1`, `.auto-style-2`

**Features:**
- Deduplicates identical styles
- Preserves existing CSS (`@media`, `:hover`, etc.)
- Minimal HTML modifications
- Clean, semantic CSS output

---

### `reverseCSSExternal(input: string): Promise<{html: string, css: string}>`

Extracts inline styles to external CSS file.

**Parameters:**
- `input` - HTML string or URL

**Returns:** Object with `html` and `css` strings

**Use Case:** Production websites that benefit from browser caching

```typescript
const { html, css } = await reverseCSSExternal(inlinedHTML);
// html: contains <link rel="stylesheet" href="styles.css">
// css: all extracted CSS rules
```

## 🎨 Use Cases

### Email Templates
```typescript
// Convert CSS to inline for email clients
const emailHTML = await inlineCSS(template);
sendEmail(emailHTML);
```

### Production Optimization
```typescript
// Extract inline CSS to cacheable file
const { html, css } = await reverseCSSExternal(buildOutput);
writeFileSync('index.html', html);
writeFileSync('styles.css', css);
```

### Development Workflow
```typescript
// Convert messy inline styles to readable CSS
const readable = await reverseCSSInternal(legacyHTML);
```

### Round-Trip Conversion
```typescript
// Chain conversions for different outputs
const inlined = await inlineCSS(original);
const withStyleTag = await reverseCSSInternal(inlined);
const { html, css } = await reverseCSSExternal(withStyleTag);
```

## 🔧 Advanced Examples

### Responsive Design
```typescript
const html = `
<style>
  .container { max-width: 1200px; }
  @media (max-width: 768px) {
    .container { max-width: 100%; }
  }
</style>
<div class="container">Content</div>
`;

const result = await inlineCSS(html);
// @media queries are preserved in <style> tag
// Regular styles are inlined
```

### Font Imports
```typescript
const html = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto');
  body { font-family: 'Roboto', sans-serif; }
</style>
<body>Text</body>
`;

const result = await inlineCSS(html);
// @import is preserved
// font-family is inlined with proper quote escaping
```

### Nested Selectors
```typescript
const html = `
<div class="nav">
  <a style="color:blue;text-decoration:none">Link 1</a>
  <a style="color:blue;text-decoration:none">Link 2</a>
</div>
`;

const result = await reverseCSSInternal(html);
// Output:
// <style>
// .nav a { color:blue; text-decoration:none; }
// </style>
// <div class="nav">
//   <a>Link 1</a>
//   <a>Link 2</a>
// </div>
```

## 📊 Performance

- **Fast parsing** - Uses optimized CSS and HTML parsers
- **Minimal overhead** - Efficient DOM traversal and style matching
- **Memory efficient** - Streaming-friendly architecture

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Osman Beyhan](LICENSE)

## 🙏 Acknowledgments

Built with:
- [css-tree](https://github.com/csstree/csstree) - CSS parser
- [htmlparser2](https://github.com/fb55/htmlparser2) - HTML parser
- [dom-serializer](https://github.com/cheeriojs/dom-serializer) - DOM to HTML

---

**Made with ❤️ for developers who work with HTML and CSS**
