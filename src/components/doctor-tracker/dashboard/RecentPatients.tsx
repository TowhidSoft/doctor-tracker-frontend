import { memo } from "react";
import Link from "next/link";
import { Empty } from "antd";
import { fromNow, initials } from "@/lib/date";
import type { Patient } from "@/redux/service/admin/patientApi";

function RecentPatients({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No patients yet" />;
  }

  return (
    <ul className="divide-y divide-[#F0F0F0]">
      {patients.map((patient) => (
        <li key={patient.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-xs font-semibold text-primary">
            {initials(patient.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-secondary-dark">{patient.name}</p>
            <p className="truncate text-xs text-text-secondary">
              {patient.condition} ·{" "}
              <Link href={`/dashboard/doctors/${patient.doctor.id}`} className="hover:text-primary hover:underline">
                {patient.doctor.name}
              </Link>
            </p>
          </div>
          <span className="shrink-0 text-xs text-text-light">{fromNow(patient.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}

export default memo(RecentPatients);
