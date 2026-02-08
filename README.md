# CSS Formatter CLI

> **A powerful CLI for bidirectional CSS-HTML conversion, powered by [@osmn-byhn/css-formatter](https://www.npmjs.com/package/@osmn-byhn/css-formatter).**

This tool allows you to convert between external/internal CSS and inline styles effortlessly directly from your terminal. It's perfect for email templates, production optimization, and modernizing legacy HTML.

## 🚀 Key Features

- **Bidirectional Conversion**: Move styles from `<style>` tags to inline attributes and back.
- **Smart Selector Generation**: Automatically generates clean, semantic CSS selectors based on existing classes and structure.
- **Preserves Critical CSS**: Keeps `@media` queries, `:hover` states, and `@font-face` rules in a `<style>` tag while inlining the rest.
- **Style Deduplication**: Groups identical inline styles under single CSS rules to keep your output clean.

## 📦 Installation

You can install it globally via npm:

```bash
npm install -g @osmn-byhn/css-formatter-cli
```

Or run it instantly using npx:

```bash
npx css-formatter <command> [options]
```

## 🎯 Usage & Commands

### 1. Inlining CSS (`inline`)
Converts all CSS from `<style>` tags and linked stylesheets into inline `style` attributes.

```bash
css-formatter inline input.html -o output.html
```
- **Use Case**: Preparing HTML for email clients that only support inline styles.

---

### 2. Extracting to Internal CSS (`internal`)
Extracts all inline `style` attributes and moves them into a single `<style>` tag in the `<head>`.

```bash
css-formatter internal input.html -o output.html
```
- **Use Case**: Refactoring messy inline styles into a readable, centralized format.

---

### 3. Extracting to External CSS (`extract`)
Extracts inline styles into a separate `.css` file and adds a `<link>` tag to the HTML.

```bash
css-formatter extract input.html styles.css -o output.html
```
- **Use Case**: Optimizing production websites for browser caching by separating CSS from HTML.

## 🔧 Options

| Argument | Description |
| :--- | :--- |
| `<input>` | Path to your input HTML file. |
| `[cssOutput]` | (Extract only) Name of the generated CSS file. |
| `-o, --output` | Custom path for the output HTML (defaults to overwriting input). |
| `-v, --version` | Display version information. |
| `-h, --help` | Display help for commands. |

## 📄 License

MIT © Osman Beyhan
