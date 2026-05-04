"use client";

import type { ReactNode } from "react";
import { ChamferedCap } from "./ChamferedCap";

export type ChamferedTableAlign = "start" | "center" | "end";

export type ChamferedTableColumn<T> = {
  /** Stable key — used for React keys and cell ordering. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** CSS grid track size, e.g. "28%", "12%", "minmax(0, 1fr)". */
  width: string;
  /** Header + cell alignment. Default "start". */
  align?: ChamferedTableAlign;
  /** Override the default header cell classes. */
  headerClassName?: string;
  /** Override the default data cell classes. */
  cellClassName?: string;
  /** Render the cell content for a given row. */
  cell: (row: T, index: number) => ReactNode;
};

type ChamferedTableProps<T> = {
  columns: ChamferedTableColumn<T>[];
  rows: T[];
  /** Stable key per row. */
  rowKey: (row: T) => string | number;
  loading?: boolean;
  /** Shown in the bordered band when `loading` is true. */
  loadingLabel?: ReactNode;
  /** Shown in the bordered band when `rows` is empty and not loading. */
  emptyLabel?: ReactNode;
  /** Extra classes appended to each data row's grid container. */
  rowClassName?: string;
  /**
   * Optional narrow-layout renderer. When provided, below 504px the grid is
   * hidden and the caller's nodes render in a single bordered band instead.
   * The component appends `border-b` between items automatically; the last
   * item's separator is dropped.
   */
  renderNarrow?: (row: T, index: number) => ReactNode;
  /**
   * Optional footer rendered inside the bordered band below all rows. Useful
   * for "Total" rows or summary lines. Renders in both wide and narrow
   * layouts; provide one element via `footer` (used for both) or override the
   * narrow rendering with `footerNarrow`.
   */
  footer?: ReactNode;
  /** Optional narrow-layout footer override; falls back to `footer` if omitted. */
  footerNarrow?: ReactNode;
  /** Skip the chamfered top + bottom caps (e.g. when the parent already supplies them). */
  capless?: boolean;
  className?: string;
};

const HEADER_CELL_BASE =
  "px-5 py-3 text-sm font-medium text-[var(--tott-dash-gold-label)]";
const DATA_CELL_BASE = "px-5 py-3 text-sm text-foreground";
const ROW_BASE =
  "border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]";

function alignClasses(align: ChamferedTableAlign | undefined): string {
  switch (align) {
    case "center":
      return "justify-center text-center";
    case "end":
      return "justify-end text-end";
    default:
      return "justify-start text-start";
  }
}

export function ChamferedTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  loadingLabel,
  emptyLabel,
  rowClassName,
  renderNarrow,
  footer,
  footerNarrow,
  capless,
  className,
}: ChamferedTableProps<T>) {
  const gridTemplateColumns = columns.map((c) => c.width).join(" ");
  const gridStyle = { gridTemplateColumns } as const;

  const placeholder = loading ? loadingLabel : rows.length === 0 ? emptyLabel : null;
  const narrowFooter = footerNarrow ?? footer;

  return (
    <div className={className}>
      {capless ? null : <ChamferedCap direction="top" />}

      {/* Wide layout — true grid table. ≥504px. */}
      <div className={renderNarrow ? "hidden min-[504px]:block" : "block"}>
        <div
          className="grid border-x border-y border-[var(--tott-card-border)]"
          style={gridStyle}
          role="row"
        >
          {columns.map((col) => (
            <div
              key={col.key}
              role="columnheader"
              className={
                col.headerClassName ??
                `${HEADER_CELL_BASE} flex items-center ${alignClasses(col.align)}`
              }
            >
              {col.header}
            </div>
          ))}
        </div>

        {placeholder ? (
          <div className="border-x border-b border-[var(--tott-card-border)] px-5 py-12 text-center text-sm text-[var(--tott-muted)]">
            {placeholder}
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={rowKey(row)}
              role="row"
              className={`grid ${ROW_BASE}${rowClassName ? ` ${rowClassName}` : ""}`}
              style={gridStyle}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  role="cell"
                  className={
                    col.cellClassName ??
                    `${DATA_CELL_BASE} flex items-center ${alignClasses(col.align)}`
                  }
                >
                  {col.cell(row, index)}
                </div>
              ))}
            </div>
          ))
        )}

        {footer ? (
          <div className="border-x border-b border-[var(--tott-card-border)]">
            {footer}
          </div>
        ) : null}
      </div>

      {/* Narrow layout — caller-supplied stack. <504px. */}
      {renderNarrow ? (
        <div className="border-x border-y border-[var(--tott-card-border)] min-[504px]:hidden">
          {placeholder ? (
            <div className="px-3 py-12 text-center text-sm text-[var(--tott-muted)]">
              {placeholder}
            </div>
          ) : (
            <>
              {rows.map((row, index) => {
                const isLast = index === rows.length - 1;
                const showSeparator = !isLast || Boolean(narrowFooter);
                return (
                  <div
                    key={rowKey(row)}
                    className={
                      showSeparator
                        ? "border-b border-[var(--tott-card-border)]"
                        : ""
                    }
                  >
                    {renderNarrow(row, index)}
                  </div>
                );
              })}
              {narrowFooter ? <div>{narrowFooter}</div> : null}
            </>
          )}
        </div>
      ) : null}

      {capless ? null : <ChamferedCap direction="bottom" />}
    </div>
  );
}
