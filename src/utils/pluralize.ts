/**
 * Retorna o número seguido da forma singular ou plural do substantivo.
 * Ex.: pluralize(1, 'registro', 'registros') => "1 registro"
 *      pluralize(2, 'registro', 'registros') => "2 registros"
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  const n = Math.abs(count);
  const word = n === 1 ? singular : plural;
  return `${count} ${word}`;
}
