"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE } from "@/lib/theme";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Saves the choice in a cookie; Next re-renders the layout with the new data-theme. */
export async function setTheme(formData: FormData): Promise<void> {
  const theme = formData.get("theme");
  const store = await cookies();

  if (theme === "light" || theme === "dark") store.set(THEME_COOKIE, theme, { path: "/", maxAge: ONE_YEAR });
  else store.delete(THEME_COOKIE);
}
