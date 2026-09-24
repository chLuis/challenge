export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-16">
      <h1 className="text-xl font-semibold">Falta configurar la base de datos</h1>
      <p className="text-muted">
        La app no encuentra estas variables de entorno, así que no puede leer las reseñas:
      </p>
      <ul className="list-inside list-disc font-mono text-sm">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Cargalas en <code>.env.local</code> (o en Vercel) con los valores de Supabase. En{" "}
        <code>.env.example</code> está de dónde sale cada una.
      </p>
    </main>
  );
}
