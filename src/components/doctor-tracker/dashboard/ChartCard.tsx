import { memo, ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
  className?: string;
  height?: number;
}

function ChartCard({ title, description, children, isEmpty, emptyText = "No data for this period yet.", className = "", height = 260 }: ChartCardProps) {
  return (
    <section className={`rounded-xl border border-[#E5E7EB] bg-white p-5 ${className}`}>
      <h2 className="font-poppins text-base font-semibold text-secondary-dark">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
      <div className="mt-4" style={{ minHeight: height }}>
        {isEmpty ? (
          <div className="grid place-items-center text-sm text-text-secondary" style={{ height }}>
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default memo(ChartCard);
