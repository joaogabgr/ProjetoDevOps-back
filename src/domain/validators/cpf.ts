/**
 * Valida um CPF pelo algoritmo oficial de dígitos verificadores da Receita Federal.
 *
 * Regra de negócio pura — não depende de HTTP nem de banco, por isso mora no domínio.
 * Aceita o valor com ou sem máscara (`111.444.777-35` ou `11144477735`).
 */
export function isValidCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // ex.: 000.000.000-00, 111.111.111-11

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9));
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 9) + firstCheckDigit);

  return digits === digits.slice(0, 9) + firstCheckDigit + secondCheckDigit;
}

/** Remove pontuação, deixando só os dígitos — usado para normalizar antes de persistir. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function calculateCheckDigit(base: string): number {
  let factor = base.length + 1;
  let total = 0;

  for (const char of base) {
    total += Number(char) * factor--;
  }

  const remainder = (total * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}
