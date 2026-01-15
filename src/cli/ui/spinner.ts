import ora, { type Ora } from 'ora';
import chalk from 'chalk';

/**
 * Theme colors for mindkit
 */
export const theme = {
  primary: chalk.hex('#7C3AED'),
  secondary: chalk.hex('#06B6D4'),
  accent: chalk.hex('#F59E0B'),
  success: chalk.hex('#10B981'),
  error: chalk.hex('#EF4444'),
  dim: chalk.dim,
  bold: chalk.bold,
};

/**
 * Create a spinner with mindkit theme
 */
export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'magenta',
    spinner: 'dots',
  });
}

/**
 * Print the mindkit logo
 */
export function printLogo(): void {
  const logo = `
   ${theme.primary('╭─────╮')}
  ${theme.primary('╭┤')} ${theme.secondary('◉ ◉')} ${theme.primary('├╮')}
  ${theme.primary('│╰──┬──╯│')}
  ${theme.primary('╰───┴───╯')}
   ${theme.bold('mindkit')}
`;
  console.log(logo);
}

/**
 * Print a section header
 */
export function printHeader(text: string): void {
  console.log();
  console.log(theme.primary.bold(`▸ ${text}`));
  console.log();
}

/**
 * Print a success message
 */
export function printSuccess(text: string): void {
  console.log(theme.success(`✓ ${text}`));
}

/**
 * Print an error message
 */
export function printError(text: string): void {
  console.log(theme.error(`✗ ${text}`));
}

/**
 * Print a warning message
 */
export function printWarning(text: string): void {
  console.log(theme.accent(`⚠ ${text}`));
}

/**
 * Print an info message
 */
export function printInfo(text: string): void {
  console.log(theme.secondary(`ℹ ${text}`));
}

/**
 * Print a list item
 */
export function printListItem(text: string, indent = 0): void {
  const spaces = '  '.repeat(indent);
  console.log(`${spaces}${theme.dim('•')} ${text}`);
}

/**
 * Print a key-value pair
 */
export function printKeyValue(key: string, value: string): void {
  console.log(`  ${theme.dim(key + ':')} ${value}`);
}

/**
 * Print installation summary
 */
export function printInstallSummary(
  results: Array<{ tool: string; success: number; failed: number }>
): void {
  printHeader('Installation Summary');

  for (const result of results) {
    const status =
      result.failed === 0
        ? theme.success(`✓ ${result.tool}`)
        : theme.error(`✗ ${result.tool}`);

    console.log(
      `  ${status}: ${result.success} installed, ${result.failed} failed`
    );
  }

  console.log();
}
