import { readFile } from "node:fs/promises";
import type { ImportPlan } from "@/lib/import/plan";
import { runImport } from "@/lib/import/run-import";
import { createAdminClient } from "@/lib/supabase/admin";

async function main() {
  const path = process.argv[2] ?? "reviews.json";
  const raw: unknown = JSON.parse(await readFile(path, "utf8"));
  const plan = await runImport(createAdminClient(), raw);
  printReport(path, plan);
}

function printReport(path: string, plan: ImportPlan) {
  console.log(`Importado ${path}`);
  console.log(`  creadas:      ${plan.toCreate.length}`);
  console.log(`  actualizadas: ${plan.toUpdate.length}`);
  console.log(`  sin cambios:  ${plan.unchanged.length}`);
  console.log(`  salteadas:    ${plan.skipped.length}`);

  for (const { id, reason } of plan.skipped) {
    console.log(`    - ${id}: ${reason}`);
  }
  for (const id of plan.duplicates) {
    console.log(`  ${id} aparece más de una vez; quedó la versión con updated_at más nuevo`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
