export const PASSWORD = 'TestPass123!';

export const INJECTION_SCRIPTS = {
  html: '<script>alert(1)</script>',
  sql: "' OR 1=1 --",
  sqlLogin: "' OR '1'='1",
  unicode: '\uD83D\uDE00\uD83D\uDD25test',
} as const;

export const WHITESPACE_ONLY = '   ';
