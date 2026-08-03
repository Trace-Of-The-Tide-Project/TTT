/** Angled end-caps only (start/end edges), flat top/bottom — the Figma
 * "Label" pill shape (Edition / article-count chips): a rectangle with
 * its left and right edges cut to a point, half the element height.
 * Plain function, no "use client" — safe to call from server components. */
export const pillClipPath = (heightPx: number) => {
  const c = heightPx / 2;
  return `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% 50%, calc(100% - ${c}px) 100%, ${c}px 100%, 0 50%)`;
};
