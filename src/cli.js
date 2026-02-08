#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { inlineCSS, reverseCSSInternal, reverseCSSExternal } from '@osmn-byhn/css-formatter';

const program = new Command();

program
  .name('css-formatter')
  .description('CLI tool for inlining and extracting CSS using @osmn-byhn/css-formatter')
  .version('1.0.0');

program
  .command('inline')
  .description('Inlines CSS into the HTML file')
  .argument('<input>', 'Input HTML file path')
  .option('-o, --output <path>', 'Output file path (defaults to overwriting input)')
  .action(async (input, options) => {
    try {
      const inputPath = path.resolve(input);
      const html = await fs.readFile(inputPath, 'utf-8');
      
      console.log(chalk.blue(`🚀 Inlining CSS in ${input}...`));
      const result = await inlineCSS(html);
      
      const outputPath = options.output ? path.resolve(options.output) : inputPath;
      await fs.writeFile(outputPath, result);
      
      console.log(chalk.green(`✅ Successfully inlined CSS. Saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('internal')
  .description('Extracts inline styles into a <style> tag')
  .argument('<input>', 'Input HTML file path')
  .option('-o, --output <path>', 'Output file path (defaults to overwriting input)')
  .action(async (input, options) => {
    try {
      const inputPath = path.resolve(input);
      const html = await fs.readFile(inputPath, 'utf-8');
      
      console.log(chalk.blue(`🚀 Extracting inline styles to internal <style> tag in ${input}...`));
      const result = await reverseCSSInternal(html);
      
      const outputPath = options.output ? path.resolve(options.output) : inputPath;
      await fs.writeFile(outputPath, result);
      
      console.log(chalk.green(`✅ Successfully extracted styles to internal <style>. Saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('extract')
  .description('Extracts inline styles into an external CSS file')
  .argument('<input>', 'Input HTML file path')
  .argument('[cssOutput]', 'Output CSS file path (defaults to styles.css)')
  .option('-o, --output <path>', 'Output HTML file path (defaults to overwriting input)')
  .action(async (input, cssOutput, options) => {
    try {
      const inputPath = path.resolve(input);
      const html = await fs.readFile(inputPath, 'utf-8');
      
      const cssFileName = cssOutput || 'styles.css';
      const cssPath = path.resolve(path.dirname(inputPath), cssFileName);
      
      console.log(chalk.blue(`🚀 Extracting inline styles from ${input} to ${cssFileName}...`));
      const { html: htmlOutput, css: cssResult } = await reverseCSSExternal(html);
      
      // The library's reverseCSSExternal might be putting a default link tag.
      // We should check if we need to adjust the link tag href if the user provided a specific path.
      
      const outputPath = options.output ? path.resolve(options.output) : inputPath;
      
      await fs.writeFile(outputPath, htmlOutput);
      await fs.writeFile(cssPath, cssResult);
      
      console.log(chalk.green(`✅ Successfully extracted styles.`));
      console.log(chalk.green(`   HTML saved to: ${outputPath}`));
      console.log(chalk.green(`   CSS saved to: ${cssPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
