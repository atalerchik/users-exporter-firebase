import type { HashAlgorithmType } from "firebase-admin/auth";

declare module "bun" {
  interface Env {
    KEY: string;
    SALT_SEPARATOR: string;
    HASH_ROUNDS: number;
    MEMORY_COST: number;
    ALGORITHM: HashAlgorithmType;
  }
}
