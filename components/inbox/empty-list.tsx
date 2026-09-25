import { EmptyMessage } from "@/components/ui/empty-message";
import { hasNarrowingFilters } from "@/lib/reviews/filters";
import type { ReviewFilters } from "@/types/reviews";

interface EmptyListProps {
  filters: ReviewFilters;
  hasAnyReview: boolean;
  emptyLocation: string | null;
  onClearFilters: () => void;
}

export function EmptyList({ filters, hasAnyReview, emptyLocation, onClearFilters }: EmptyListProps) {
  if (!hasAnyReview) {
    return (
      <EmptyMessage title="Todavía no hay reseñas cargadas.">
        Importá el archivo con <code className="rounded bg-bg px-1">npm run import</code> y volvé a abrir esta página.
      </EmptyMessage>
    );
  }

  if (emptyLocation) {
    return (
      <EmptyMessage title={`${emptyLocation} todavía no tiene reseñas.`}>
        Cuando lleguen en el próximo archivo importado, van a aparecer acá.
      </EmptyMessage>
    );
  }

  if (!hasNarrowingFilters(filters) && filters.status === "sin-responder") {
    return <EmptyMessage title="No queda nada por responder.">Las reseñas nuevas van a aparecer acá.</EmptyMessage>;
  }

  return (
    <EmptyMessage title="Ninguna reseña coincide con estos filtros.">
      <button type="button" onClick={onClearFilters} className="underline underline-offset-2">
        Ver todas las sedes y calificaciones
      </button>
    </EmptyMessage>
  );
}
