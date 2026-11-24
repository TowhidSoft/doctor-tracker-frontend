import { memo, ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "primary" | "teal" | "accent";
}

const TONES = {
  primary: "bg-primary-light text-primary",
  teal: "bg-teal-light text-teal-dark",
  accent: "bg-[#FDEBD8] text-accent-dark",
} as const;

function StatCard({ label, value, hint, icon, tone = "primary" }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="mt-0.5 font-poppins text-2xl font-semibold text-secondary-dark">{value}</p>
        {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
      </div>
    </div>
  );
}

export default memo(StatCard);
