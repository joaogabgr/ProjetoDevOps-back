import { describe, expect, it } from 'vitest';
import { isValidCPF, onlyDigits } from '../../src/domain/validators/cpf';

describe('isValidCPF', () => {
  it('aceita um CPF válido sem máscara', () => {
    expect(isValidCPF('11144477735')).toBe(true);
  });

  it('aceita um CPF válido com máscara', () => {
    expect(isValidCPF('111.444.777-35')).toBe(true);
  });

  it('rejeita um CPF com dígito verificador incorreto', () => {
    expect(isValidCPF('11144477736')).toBe(false);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(isValidCPF('11111111111')).toBe(false);
    expect(isValidCPF('00000000000')).toBe(false);
  });

  it('rejeita CPF com quantidade de dígitos diferente de 11', () => {
    expect(isValidCPF('123456789')).toBe(false);
    expect(isValidCPF('123456789012')).toBe(false);
  });

  it('rejeita string vazia ou não numérica', () => {
    expect(isValidCPF('')).toBe(false);
    expect(isValidCPF('abc.def.ghi-jk')).toBe(false);
  });
});

describe('onlyDigits', () => {
  it('remove pontuação e traço de um CPF mascarado', () => {
    expect(onlyDigits('111.444.777-35')).toBe('11144477735');
  });

  it('mantém apenas os dígitos de qualquer string', () => {
    expect(onlyDigits('a1b2c3')).toBe('123');
  });
});
