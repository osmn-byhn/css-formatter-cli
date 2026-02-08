"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  inlineCSS: () => inlineCSS,
  inlineCSSToDOM: () => inlineCSSToDOM,
  reverseCSS: () => reverseCSS,
  reverseCSSExternal: () => reverseCSSExternal,
  reverseCSSInternal: () => reverseCSSInternal
});
module.exports = __toCommonJS(index_exports);
var import_node_fetch2 = __toESM(require("node-fetch"), 1);
var import_dom_serializer = __toESM(require("dom-serializer"), 1);

// src/html/parser.ts
var import_htmlparser2 = require("htmlparser2");
function parseHTML(html) {
  return (0, import_htmlparser2.parseDocument)(html);
}

// src/css/parser.ts
var csstree = __toESM(require("css-tree"), 1);
var import_node_fetch = __toESM(require("node-fetch"), 1);
async function extractCSS(dom) {
  let cssText = "";
  const styleTags = findNodes(dom, "style");
  for (const styleNode of styleTags) {
    cssText += styleNode.children?.[0]?.data || "";
    if (styleNode.parent && styleNode.parent.children) {
      styleNode.parent.children = styleNode.parent.children.filter(
        (n) => n !== styleNode
      );
    }
  }
  const links = findNodes(dom, "link");
  for (const link of links) {
    if (link.attribs?.rel === "stylesheet" && link.attribs.href) {
      const res = await (0, import_node_fetch.default)(link.attribs.href);
      cssText += await res.text();
    }
  }
  return {
    cssText,
    cleanHTML: dom
  };
}
function findNodes(node, tag, acc = []) {
  if (node.name === tag) acc.push(node);
  node.children?.forEach((c) => findNodes(c, tag, acc));
  return acc;
}

// src/css/apply.ts
var csstree2 = __toESM(require("css-tree"), 1);

// src/utils/styleMerge.ts
function mergeStyles(oldStyle = "", newStyle = "") {
  const map = /* @__PURE__ */ new Map();
  function parse3(s) {
    s.split(";").forEach((r) => {
      const [k, v] = r.split(":");
      if (k && v) {
        const cleanValue = v.trim().replace(/"/g, "'");
        map.set(k.trim(), cleanValue);
      }
    });
  }
  parse3(oldStyle);
  parse3(newStyle);
  return [...map.entries()].map(([k, v]) => `${k}:${v}`).join(";");
}

// src/css/apply.ts
function applyCSS(dom, cssText) {
  const ast = csstree2.parse(cssText);
  const preservedRules = [];
  csstree2.walk(ast, {
    visit: "Atrule",
    enter(node) {
      const name = node.name;
      if (name === "font-face" || name === "import" || name === "keyframes" || name === "media") {
        preservedRules.push(csstree2.generate(node));
      }
    }
  });
  csstree2.walk(ast, {
    visit: "Rule",
    enter(node) {
      if (this.atrule) {
        return;
      }
      const selector = csstree2.generate(node.prelude).trim();
      if (selector.includes(":")) {
        preservedRules.push(csstree2.generate(node));
        return;
      }
      const styles = [];
      csstree2.walk(node.block, {
        visit: "Declaration",
        enter(decl) {
          styles.push(`${decl.property}:${csstree2.generate(decl.value)}`);
        }
      });
      if (styles.length === 0) return;
      const matchingNodes = findMatchingElements(dom, selector);
      matchingNodes.forEach((el) => {
        el.attribs = el.attribs || {};
        el.attribs.style = mergeStyles(el.attribs.style || "", styles.join(";"));
      });
    }
  });
  return {
    dom,
    preservedCSS: preservedRules.join("\n")
  };
}
function findMatchingElements(node, selector) {
  if (selector.includes(" ")) {
    return findDescendantMatches(node, selector);
  }
  const dotCount = (selector.match(/\./g) || []).length;
  const isCompound = dotCount > 1 || dotCount === 1 && !selector.startsWith(".");
  if (isCompound) {
    return findCompoundMatches(node, selector);
  }
  return findSimpleMatches(node, selector);
}
function findDescendantMatches(node, selector) {
  const parts = selector.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [];
  const lastSelector = parts[parts.length - 1];
  const ancestors = parts.slice(0, -1);
  const candidates = findSimpleMatches(node, lastSelector);
  return candidates.filter((candidate) => {
    let current = candidate.parent;
    let ancestorIndex = ancestors.length - 1;
    while (current && ancestorIndex >= 0) {
      if (matchesSimpleSelector(current, ancestors[ancestorIndex])) {
        ancestorIndex--;
      }
      current = current.parent;
    }
    return ancestorIndex < 0;
  });
}
function findCompoundMatches(node, selector) {
  const results = [];
  function traverse(n) {
    if (n.type === "tag" && matchesCompoundSelector(n, selector)) {
      results.push(n);
    }
    n.children?.forEach(traverse);
  }
  traverse(node);
  return results;
}
function matchesCompoundSelector(element, selector) {
  const parts = selector.split(".").filter(Boolean);
  const startsWithDot = selector.startsWith(".");
  const tagName = startsWithDot ? null : parts[0];
  const classes = startsWithDot ? parts : parts.slice(1);
  if (tagName && element.name !== tagName) {
    return false;
  }
  const elementClasses = element.attribs?.class?.split(" ").filter(Boolean) || [];
  return classes.every((cls) => elementClasses.includes(cls));
}
function findSimpleMatches(node, selector) {
  const results = [];
  function traverse(n) {
    if (n.type === "tag" && matchesSimpleSelector(n, selector)) {
      results.push(n);
    }
    n.children?.forEach(traverse);
  }
  traverse(node);
  return results;
}
function matchesSimpleSelector(element, selector) {
  if (selector === "*") {
    return true;
  }
  if (selector.startsWith(".")) {
    const className = selector.slice(1);
    const elementClasses = element.attribs?.class?.split(" ").filter(Boolean) || [];
    return elementClasses.includes(className);
  }
  return element.name === selector;
}

// src/css/reverse.ts
function reverseInlineStyles(dom) {
  const entries = [];
  const autoClassCounter = { count: 0 };
  function walk2(node, parent = null) {
    if (node.type !== "tag") {
      if (node.children) {
        node.children.forEach((child) => walk2(child, node));
      }
      return;
    }
    if (node.attribs?.style) {
      const inlineStyle = node.attribs.style.trim();
      if (inlineStyle) {
        const normalized = normalizeStyle(inlineStyle);
        const selector = generateSelector(node, parent, autoClassCounter);
        entries.push({
          selector,
          normalizedStyle: normalized,
          element: node
        });
      }
      delete node.attribs.style;
    }
    if (node.children) {
      node.children.forEach((child) => walk2(child, node));
    }
  }
  walk2(dom);
  return buildCSS(entries);
}
function generateSelector(element, parent, autoClassCounter) {
  if (element.attribs?.class) {
    const existingClass = element.attribs.class.split(" ")[0];
    return `.${existingClass}`;
  }
  const parentWithClass = findParentWithClass(parent);
  if (parentWithClass) {
    const parentClass = parentWithClass.attribs.class.split(" ")[0];
    return `.${parentClass} ${element.name}`;
  }
  if (["body", "html", "head"].includes(element.name)) {
    return element.name;
  }
  const autoClass = `auto-style-${++autoClassCounter.count}`;
  if (element.attribs.class) {
    element.attribs.class = `${element.attribs.class} ${autoClass}`;
  } else {
    element.attribs.class = autoClass;
  }
  return `.${autoClass}`;
}
function findParentWithClass(node) {
  if (!node) return null;
  if (node.type === "tag" && node.attribs?.class) {
    return node;
  }
  return findParentWithClass(node.parent);
}
function normalizeStyle(style) {
  const properties = style.split(";").map((p) => p.trim()).filter(Boolean).sort();
  return properties.join(";");
}
function buildCSS(entries) {
  const styleGroups = /* @__PURE__ */ new Map();
  entries.forEach(({ selector, normalizedStyle }) => {
    if (!styleGroups.has(normalizedStyle)) {
      styleGroups.set(normalizedStyle, /* @__PURE__ */ new Set());
    }
    styleGroups.get(normalizedStyle).add(selector);
  });
  const rules = [];
  styleGroups.forEach((selectors, normalizedStyle) => {
    const selectorList = Array.from(selectors).join(",\n");
    const declarations = normalizedStyle.split(";").map((prop) => `  ${prop}`).join(";\n");
    rules.push(`${selectorList} {
${declarations};
}`);
  });
  return rules.join("\n\n");
}

// src/index.ts
async function inlineCSS(input) {
  const dom = await inlineCSSToDOM(input);
  return domToHTML(dom);
}
async function inlineCSSToDOM(input) {
  let html = input;
  if (/^https?:\/\//.test(input)) {
    const res = await (0, import_node_fetch2.default)(input);
    html = await res.text();
  }
  const dom = parseHTML(html);
  const { cssText, cleanHTML } = await extractCSS(dom);
  const { dom: resultDom, preservedCSS } = applyCSS(cleanHTML, cssText);
  if (preservedCSS && preservedCSS.trim()) {
    injectPreservedCSS(resultDom, preservedCSS);
  }
  return resultDom;
}
async function reverseCSSInternal(input) {
  const dom = await reverseCSS(input);
  return domToHTML(dom);
}
async function reverseCSS(input) {
  let html = input;
  if (/^https?:\/\//.test(input)) {
    const res = await (0, import_node_fetch2.default)(input);
    html = await res.text();
  }
  const dom = parseHTML(html);
  const existingCSS = collectExistingCSS(dom);
  const reversedCSS = reverseInlineStyles(dom);
  const allCSS = [existingCSS, reversedCSS].filter((css) => css && css.trim()).join("\n\n");
  if (allCSS && allCSS.trim()) {
    injectPreservedCSS(dom, allCSS);
  }
  return dom;
}
async function reverseCSSExternal(input) {
  let html = input;
  if (/^https?:\/\//.test(input)) {
    const res = await (0, import_node_fetch2.default)(input);
    html = await res.text();
  }
  const dom = parseHTML(html);
  const existingCSS = collectExistingCSS(dom);
  const reversedCSS = reverseInlineStyles(dom);
  const allCSS = [existingCSS, reversedCSS].filter((css) => css && css.trim()).join("\n\n");
  const head = findNode(dom, "head");
  if (head && allCSS && allCSS.trim()) {
    const linkNode = {
      type: "tag",
      name: "link",
      attribs: {
        rel: "stylesheet",
        href: "styles.css"
      },
      children: [],
      parent: head
    };
    head.children = head.children || [];
    head.children.push(linkNode);
  }
  return {
    html: domToHTML(dom),
    css: allCSS || ""
  };
}
function domToHTML(dom) {
  let html = (0, import_dom_serializer.default)(dom);
  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, open, content, close) => {
    const unescaped = content.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return open + unescaped + close;
  });
  return html;
}
function collectExistingCSS(dom) {
  const cssBlocks = [];
  const nodesToRemove = [];
  function walk2(node) {
    if (node.type === "tag" && node.name === "style") {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.type === "text" && child.data) {
            cssBlocks.push(child.data.trim());
          }
        });
      }
      nodesToRemove.push({ parent: node.parent, node });
    }
    if (node.children) {
      const children = [...node.children];
      children.forEach(walk2);
    }
  }
  walk2(dom);
  nodesToRemove.forEach(({ parent, node }) => {
    if (parent?.children) {
      const index = parent.children.indexOf(node);
      if (index > -1) {
        parent.children.splice(index, 1);
      }
    }
  });
  return cssBlocks.join("\n\n");
}
function injectPreservedCSS(dom, css) {
  const head = findNode(dom, "head");
  if (head) {
    const styleNode = {
      type: "tag",
      name: "style",
      attribs: {},
      children: [{ type: "text", data: `
${css}
` }],
      parent: head
    };
    head.children = head.children || [];
    head.children.push(styleNode);
  }
}
function findNode(node, tagName) {
  if (node.name === tagName) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, tagName);
      if (found) return found;
    }
  }
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  inlineCSS,
  inlineCSSToDOM,
  reverseCSS,
  reverseCSSExternal,
  reverseCSSInternal
});
