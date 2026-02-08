import { Document } from 'domhandler';

/**
 * Forward conversion: CSS to inline styles (returns HTML string)
 * @param input - HTML string or URL
 * @returns HTML with inlined CSS
 */
declare function inlineCSS(input: string): Promise<string>;
/**
 * Forward conversion: CSS to inline styles (returns DOM)
 * @param input - HTML string or URL
 * @returns DOM with inlined CSS
 */
declare function inlineCSSToDOM(input: string): Promise<any>;
/**
 * Reverse conversion: inline styles to internal CSS (returns HTML string)
 * @param input - HTML string or URL
 * @returns HTML with CSS in <style> tag
 */
declare function reverseCSSInternal(input: string): Promise<string>;
/**
 * Reverse conversion: inline styles to internal CSS (returns DOM)
 * @param input - HTML string or URL
 * @returns DOM with inline styles converted to CSS in a style tag
 */
declare function reverseCSS(input: string): Promise<Document>;
/**
 * Reverse conversion: inline styles to external CSS file
 * @param input - HTML string or URL
 * @returns Object with HTML and CSS strings
 */
declare function reverseCSSExternal(input: string): Promise<{
    html: string;
    css: string;
}>;

export { inlineCSS, inlineCSSToDOM, reverseCSS, reverseCSSExternal, reverseCSSInternal };
