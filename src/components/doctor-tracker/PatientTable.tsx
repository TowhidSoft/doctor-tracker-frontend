"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Button, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date";
import type { Patient } from "@/redux/service/admin/patientApi";
import DataTable from "./DataTable";
import type { ApiMeta } from "@/redux/service/admin/doctorApi";

interface PatientTableProps {
  data: Patient[];
  loading: boolean;
  meta?: ApiMeta | null;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
  onLimitChange: (limit: number) => void;
  onDelete: (patient: Patient) => void;
  /** Omit to hide the edit action (the doctor page only adds and deletes). */
  onEdit?: (patient: Patient) => void;
  /** The global list shows which doctor each patient belongs to. */
  showDoctor?: boolean;
}

const GENDER_COLOR = { Male: "blue", Female: "magenta", Others: "default" } as const;

function PatientTable({ data, loading, meta, page, limit, onPageChange, onLimitChange, onDelete, onEdit, showDoctor }: PatientTableProps) {
  const columns = useMemo<TableColumnsType<Patient>>(() => {
    const cols: TableColumnsType<Patient> = [
      {
        title: "Patient",
        key: "name",
        width: 220,
        render: (_, p) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-secondary-dark">{p.name}</p>
            <p className="truncate text-xs text-text-secondary">{p.email ?? "No email"}</p>
          </div>
        ),
      },
      {
        title: "Age / gender",
        key: "age",
        width: 140,
        render: (_, p) => (
          <span className="whitespace-nowrap">
            {p.age} <Tag className="!ml-1" color={GENDER_COLOR[p.gender]}>{p.gender}</Tag>
          </span>
        ),
      },
      { title: "Phone", dataIndex: "phone", key: "phone", width: 150 },
      {
        title: "Condition",
        dataIndex: "condition",
        key: "condition",
        width: 180,
        render: (value: string) => <Tag color="geekblue">{value}</Tag>,
      },
    ];

    if (showDoctor) {
      cols.push({
        title: "Doctor",
        key: "doctor",
        width: 190,
        render: (_, p) => (
          <Link href={`/dashboard/doctors/${p.doctor.id}`} className="text-primary hover:underline">
            {p.doctor.name}
          </Link>
        ),
      });
    }

    cols.push(
      { title: "Added", dataIndex: "createdAt", key: "createdAt", width: 120, render: (v: string) => formatDate(v) },
      {
        title: "",
        key: "actions",
        width: 96,
        fixed: "right",
        render: (_, p) => (
          <div className="flex justify-end gap-1">
            {onEdit && (
              <Tooltip title="Edit patient">
                <Button type="text" aria-label={`Edit ${p.name}`} icon={<Pencil size={16} />} onClick={() => onEdit(p)} />
              </Tooltip>
            )}
            <Tooltip title="Delete patient">
              <Button type="text" danger aria-label={`Delete ${p.name}`} icon={<Trash2 size={16} />} onClick={() => onDelete(p)} />
            </Tooltip>
          </div>
        ),
      },
    );

    return cols;
  }, [showDoctor, onEdit, onDelete]);

  return (
    <DataTable<Patient>
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      scrollX={showDoctor ? 1100 : 900}
      emptyTitle="No patients found"
      emptyHint="Add a patient or adjust the filters."
    />
  );
}

export default memo(PatientTable);
