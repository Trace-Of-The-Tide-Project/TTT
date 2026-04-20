"use client";

import { useEffect } from "react";

/** Keeps `<html lang dir>` in sync when the `[locale]` segment changes (root layout may not re-render). */
export function HtmlLangFromLocale({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
