export function extractFilterCode(raw: string): string | null {
  if (!raw) return null;

  // remove code block formatting
  const blockMatch = raw.match(/```(?:javascript)?\n?([^`]+)```/);
  if (blockMatch) raw = blockMatch[1].trim();

  // extract inside of data.filter(...)
  const filterMatch = raw.match(/data\.filter\s*\(\s*(.*)\s*\)/);
  if (filterMatch) raw = filterMatch[1].trim();

  // extract inside of array.filter(item => ...)
  const arrowMatch = raw.match(/item\s*=>\s*(.*)/);
  if (arrowMatch) return `item => ${arrowMatch[1].trim()}`;

  return raw;
}
