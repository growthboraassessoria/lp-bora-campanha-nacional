// Manchete em linhas mascaradas. A animação de entrada é feita pela seção (q(".line__in")).
import type { ElementType, ReactNode } from "react";

type Props = {
  lines: readonly ReactNode[];
  as?: ElementType;
  size?: "xl" | "l" | "m" | "s" | "xs";
  className?: string;
  green?: readonly number[];
  outline?: readonly number[];
  id?: string;
};

export default function Headline({ lines, as: Tag = "h2", size = "m", className = "", green = [], outline = [], id }: Props) {
  return (
    <Tag id={id} className={`display display-${size} ${className}`.trim()}>
      {lines.map((l, i) => (
        <span className="line" key={i}>
          <span className="line__in">{green.includes(i) ? <span className="is-green">{l}</span> : outline.includes(i) ? <span className="is-outline">{l}</span> : l}</span>
        </span>
      ))}
    </Tag>
  );
}
