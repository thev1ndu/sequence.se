"use client";

import { useEffect } from "react";

/**
 * Removes browser extension attributes that cause hydration mismatches
 * This runs after hydration to clean up attributes added by extensions
 */
export function HydrationFix() {
  useEffect(() => {
    // Remove common browser extension attributes that cause hydration warnings
    const removeExtensionAttributes = () => {
      const attributesToRemove = [
        "bis_skin_checked",
        "data-new-gr-c-s-check-loaded",
        "data-gr-ext-installed",
        "data-1p-ignore",
        "data-lastpass-icon-root",
      ];

      attributesToRemove.forEach((attr) => {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach((el) => {
          el.removeAttribute(attr);
        });
      });
    };

    // Run after a short delay to ensure hydration is complete
    const timeoutId = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}





