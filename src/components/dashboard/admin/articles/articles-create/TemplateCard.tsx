"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { HexIconOutlined } from "./HexIconOutlined";

export type TemplateCardProps = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
};

export function TemplateCard({
  number,
  title,
  description,
  icon,
  href,
  onClick,
}: TemplateCardProps) {
  const content = (
    <>
      <div className="flex justify-center">
        <HexIconOutlined>{icon}</HexIconOutlined>
      </div>
      <p className="text-center text-sm text-gray-400">{number}</p>
      <h3 className="text-center text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-center text-sm text-gray-500">{description}</p>
    </>
  );

  const cardClass =
    "flex min-h-[200px] flex-col gap-3 rounded-lg border border-[var(--tott-card-border)] px-4 py-8 transition-colors hover:opacity-90";

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`w-full text-left ${cardClass}`}>
      {content}
    </button>
  );
}
