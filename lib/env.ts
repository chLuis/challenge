export class MissingEnvError extends Error {
  constructor(readonly missing: string[]) {
    super(`Faltan variables de entorno: ${missing.join(", ")}. Revisá .env.example.`);
  }
}

/** Returns the values in the same order, or throws naming every variable that is missing. */
export function requireEnv<const Names extends readonly string[]>(
  names: Names,
): { [Index in keyof Names]: string } {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length > 0) throw new MissingEnvError(missing);
  return names.map((name) => process.env[name] as string) as { [Index in keyof Names]: string };
}
