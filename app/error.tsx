"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function InboxError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-start gap-3 px-4 py-16">
      <h1 className="text-xl font-semibold">No pudimos cargar las reseñas</h1>
      <p className="text-muted">
        La base de datos no respondió. Puede ser algo pasajero; si se repite, revisá que el proyecto de Supabase
        esté activo.
      </p>
      <Button onClick={retry}>Reintentar</Button>
    </main>
  );
}
