/**
 * Porta para o algoritmo de hash de senha.
 *
 * O domínio só sabe que a senha precisa virar hash antes de ser persistida
 * (ver `User.password`); qual algoritmo faz isso é decisão de infraestrutura.
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
