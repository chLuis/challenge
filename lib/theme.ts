import { cookies } from "next/headers";
import type { Theme } from "@/types/theme";

export const THEME_COOKIE = "theme";

/** No cookie means "follow the system": the CSS picks the side with color-scheme. */
export async function getTheme(): Promise<Theme> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return value === "light" || value === "dark" ? value : "system";
}
