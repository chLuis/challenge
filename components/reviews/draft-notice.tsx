interface DraftNoticeProps {
  edited: boolean;
  disabled: boolean;
  onDiscard: () => void;
}

/** Keeps an unsaved model draft from ever looking like a published reply. */
export function DraftNotice({ edited, disabled, onDiscard }: DraftNoticeProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
      <p>
        <span aria-hidden>✦ </span>
        {edited ? "Borrador de IA con tus cambios" : "Borrador escrito por IA"}. Todavía no se guardó: revisalo antes de
        guardar.
      </p>
      <button type="button" onClick={onDiscard} disabled={disabled} className="underline underline-offset-2">
        Descartar borrador
      </button>
    </div>
  );
}
