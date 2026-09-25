import { readFile } from "node:fs/promises";
import type { ImportPlan } from "@/types/import";
import { runImport } from "@/lib/import/run-import";
import { createAdminClient } from "@/lib/supabase/admin";

async function main() {
  const path = process.argv[2] ?? "reviews.json";
  const raw: unknown = JSON.parse(await readFile(path, "utf8"));
  const plan = await runImport(createAdminClient(), raw);
  printReport(path, plan);
}

function printReport(path: string, plan: ImportPlan) {
  console.log(
    `Importado ${path}\n` +
      `  creadas:      ${plan.toCreate.length}\n` +
      `  actualizadas: ${plan.toUpdate.length}\n` +
      `  sin cambios:  ${plan.unchanged.length}\n` +
      `  salteadas:    ${plan.skipped.length}`,
  );

  for (const { id, reason } of plan.skipped) {
    console.log(`    - ${id}: ${reason}\n`);
  }
  for (const id of plan.duplicates) {
    console.log(`  ${id} aparece más de una vez; quedó la versión con updated_at más nuevo\n`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
