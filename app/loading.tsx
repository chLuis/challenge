export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Reseñas
          </h1>
          <p className="text-muted" role="status">
            Cargando las reseñas y el resumen de cada sede…
          </p>
        </header>

        <div
          className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8"
          aria-hidden
        >
          <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 animate-pulse">
            {[0, 1, 2, 3].map((index) => (
              <li
                key={index}
                className={`h-24 animate-pulse rounded-xl border border-border bg-surface lg:h-36 ${index === 0 ? "col-span-3 lg:col-span-1" : ""}`}
              />
            ))}
          </ul>
          <ul className="flex flex-col gap-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((index) => (
              <li
                key={index}
                className="h-44 animate-pulse rounded-xl border border-border bg-surface"
              />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
