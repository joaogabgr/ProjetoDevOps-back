/** Fuso no formato IANA, ex.: `America/Campo_Grande` (RF2). */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone });
    return true;
  } catch {
    return false;
  }
}
