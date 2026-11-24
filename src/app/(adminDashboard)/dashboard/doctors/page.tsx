"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Grid, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import PageHeader from "@/components/doctor-tracker/PageHeader";
import FilterBar, { FilterSelect } from "@/components/doctor-tracker/FilterBar";
import DataTable from "@/components/doctor-tracker/DataTable";
import DoctorFormModal from "@/components/doctor-tracker/DoctorFormModal";
import { useListParams } from "@/hooks/useListParams";
import { formatDate, initials } from "@/lib/date";
import {
  Doctor,
  DoctorListParams,
  useGetDoctorFilterOptionsQuery,
  useGetDoctorsQuery,
} from "@/redux/service/admin/doctorApi";

const INITIAL: DoctorListParams = { page: 1, limit: 10, search: "", sortBy: "createdAt", sortOrder: "desc" };

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
  { label: "Specialization A–Z", value: "specialization:asc" },
  { label: "Hospital A–Z", value: "hospital:asc" },
];

const toOptions = (values: string[] = []) => values.map((v) => ({ label: v, value: v }));

export default function DoctorsPage() {
  const router = useRouter();
  const isWide = Grid.useBreakpoint().sm ?? true; // compact action column on phones
  const [addOpen, setAddOpen] = useState(false);
  const list = useListParams<DoctorListParams>(INITIAL);
  const { params, setFilter, setSearch, setDateRange, setSort, setPage, setLimit, clampPage, reset, isDirty, sortValue } = list;

  const { data, isFetching, isError, refetch } = useGetDoctorsQuery(params);
  const { data: options, isLoading: optionsLoading } = useGetDoctorFilterOptionsQuery();

  const meta = data?.meta;
  useEffect(() => {
    if (meta) clampPage(meta.totalPages);
  }, [meta, clampPage]);

  const onSpecialization = useCallback((v?: string) => setFilter("specialization", v), [setFilter]);
  const onHospital = useCallback((v?: string) => setFilter("hospital", v), [setFilter]);

  const selects = useMemo<FilterSelect[]>(
    () => [
      { key: "specialization", placeholder: "Specialization", value: params.specialization, options: toOptions(options?.data.specializations), loading: optionsLoading, onChange: onSpecialization },
      { key: "hospital", placeholder: "Hospital", value: params.hospital, options: toOptions(options?.data.hospitals), loading: optionsLoading, onChange: onHospital },
    ],
    [params.specialization, params.hospital, options, optionsLoading, onSpecialization, onHospital],
  );

  const openDoctor = useCallback((id: string) => router.push(`/dashboard/doctors/${id}`), [router]);

  const columns = useMemo<TableColumnsType<Doctor>>(
    () => [
      {
        title: "Doctor",
        key: "name",
        width: 260,
        render: (_, d) => (
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-xs font-semibold text-primary">
              {initials(d.name)}
            </span>
            <div className="min-w-0">
              <Link href={`/dashboard/doctors/${d.id}`} className="block truncate font-medium text-secondary-dark hover:text-primary" onClick={(e) => e.stopPropagation()}>
                {d.name}
              </Link>
              <p className="truncate text-xs text-text-secondary">{d.email}</p>
            </div>
          </div>
        ),
      },
      { title: "Specialization", dataIndex: "specialization", key: "specialization", width: 170, render: (v: string) => <Tag color="geekblue">{v}</Tag> },
      { title: "Hospital", dataIndex: "hospital", key: "hospital", width: 200, ellipsis: true },
      { title: "Phone", dataIndex: "phone", key: "phone", width: 150 },
      { title: "Patients", dataIndex: "patientCount", key: "patientCount", width: 100, align: "right" },
      { title: "Added", dataIndex: "createdAt", key: "createdAt", width: 120, render: (v: string) => formatDate(v) },
      {
        title: "",
        key: "actions",
        width: isWide ? 150 : 84,
        fixed: "right",
        render: (_, d) => (
          <Button size="small" onClick={(e) => { e.stopPropagation(); openDoctor(d.id); }}>
            {isWide ? "View patients" : "View"}
          </Button>
        ),
      },
    ],
    [openDoctor, isWide],
  );

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Everyone on the roster, with the number of patients they look after."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add doctor
          </Button>
        }
      />

      <FilterBar
        search={params.search ?? ""}
        searchPlaceholder="Search name, hospital, phone or email"
        onSearchChange={setSearch}
        selects={selects}
        dateFrom={params.dateFrom}
        dateTo={params.dateTo}
        onDateChange={setDateRange}
        sortValue={sortValue}
        sortOptions={SORT_OPTIONS}
        onSortChange={setSort}
        onReset={reset}
        canReset={isDirty}
      />

      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>The doctor list could not be loaded.</span>
          <Button size="small" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      <DataTable<Doctor>
        columns={columns}
        data={data?.data ?? []}
        loading={isFetching}
        meta={meta}
        page={params.page ?? 1}
        limit={params.limit ?? 10}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(d) => openDoctor(d.id)}
        emptyTitle="No doctors found"
        emptyHint="Add a doctor or adjust the filters."
      />

      <DoctorFormModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
