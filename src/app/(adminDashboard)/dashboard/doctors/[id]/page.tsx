"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Modal, Result, Skeleton } from "antd";
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/doctor-tracker/PageHeader";
import FilterBar, { FilterSelect } from "@/components/doctor-tracker/FilterBar";
import PatientTable from "@/components/doctor-tracker/PatientTable";
import PatientFormModal from "@/components/doctor-tracker/PatientFormModal";
import DoctorFormModal from "@/components/doctor-tracker/DoctorFormModal";
import { useListParams } from "@/hooks/useListParams";
import { formatDate, initials } from "@/lib/date";
import { getErrorMessage } from "@/lib/errors";
import { GENDERS } from "@/lib/validation";
import {
  useDeleteDoctorPatientMutation,
  useGetDoctorByIdQuery,
  useGetDoctorPatientsQuery,
} from "@/redux/service/admin/doctorApi";
import { Patient, PatientListParams, useGetPatientFilterOptionsQuery } from "@/redux/service/admin/patientApi";

type DoctorPatientParams = Omit<PatientListParams, "doctorId">;

const INITIAL: DoctorPatientParams = { page: 1, limit: 10, search: "", sortBy: "createdAt", sortOrder: "desc" };

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Age: youngest first", value: "age:asc" },
  { label: "Age: oldest first", value: "age:desc" },
  { label: "Condition A–Z", value: "condition:asc" },
];

const GENDER_OPTIONS = GENDERS.map((g) => ({ label: g, value: g }));

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [modal, modalHolder] = Modal.useModal();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: doctorRes, isLoading: doctorLoading, error: doctorError } = useGetDoctorByIdQuery(id);
  const doctor = doctorRes?.data;

  const list = useListParams<DoctorPatientParams>(INITIAL);
  const { params, setFilter, setSearch, setDateRange, setSort, setPage, setLimit, clampPage, reset, isDirty, sortValue } = list;

  const { data, isFetching } = useGetDoctorPatientsQuery({ id, params });
  const { data: options, isLoading: optionsLoading } = useGetPatientFilterOptionsQuery();
  const [deletePatient] = useDeleteDoctorPatientMutation();

  const meta = data?.meta;
  useEffect(() => {
    if (meta) clampPage(meta.totalPages);
  }, [meta, clampPage]);

  const onCondition = useCallback((v?: string) => setFilter("condition", v), [setFilter]);
  const onGender = useCallback((v?: string) => setFilter("gender", v as DoctorPatientParams["gender"]), [setFilter]);

  const selects = useMemo<FilterSelect[]>(
    () => [
      { key: "condition", placeholder: "Condition", value: params.condition, options: (options?.data.conditions ?? []).map((c) => ({ label: c, value: c })), loading: optionsLoading, onChange: onCondition },
      { key: "gender", placeholder: "Gender", value: params.gender, options: GENDER_OPTIONS, onChange: onGender },
    ],
    [params.condition, params.gender, options, optionsLoading, onCondition, onGender],
  );

  const handleDelete = useCallback(
    (patient: Patient) => {
      modal.confirm({
        title: `Delete ${patient.name}?`,
        content: "This removes the patient from this doctor's list. You can't undo it.",
        okText: "Delete patient",
        okButtonProps: { danger: true },
        cancelText: "Keep patient",
        onOk: async () => {
          try {
            await deletePatient({ doctorId: id, patientId: patient.id }).unwrap();
            toast.success("Patient deleted");
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        },
      });
    },
    [modal, deletePatient, id],
  );

  const back = (
    <Link href="/dashboard/doctors" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary">
      <ArrowLeft size={14} /> All doctors
    </Link>
  );

  if (doctorLoading) {
    return (
      <div>
        {back}
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </div>
      </div>
    );
  }

  if (!doctor) {
    const notFound = (doctorError as { status?: number } | undefined)?.status === 404;
    return (
      <div>
        {back}
        <Result
          status={notFound ? "404" : "error"}
          title={notFound ? "Doctor not found" : "The doctor could not be loaded"}
          subTitle={notFound ? "This doctor may have been removed." : "Check your connection and try again."}
          extra={
            <Link href="/dashboard/doctors">
              <Button type="primary">Back to doctors</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {modalHolder}
      <PageHeader
        back={back}
        title={doctor.name}
        description={`${doctor.specialization} at ${doctor.hospital}`}
        actions={
          <>
            <Button icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>
              Edit doctor
            </Button>
            <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setAddOpen(true)}>
              Add patient
            </Button>
          </>
        }
      />

      <section className="mb-6 flex flex-col gap-5 rounded-xl border border-[#E5E7EB] bg-white p-5 md:flex-row md:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-white">
          {initials(doctor.name)}
        </span>
        <dl className="grid flex-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={16} className="shrink-0 text-text-light" />
            <dt className="sr-only">Hospital</dt>
            <dd className="truncate">{doctor.hospital}</dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Phone size={16} className="shrink-0 text-text-light" />
            <dt className="sr-only">Phone</dt>
            <dd className="truncate"><a href={`tel:${doctor.phone}`} className="hover:text-primary">{doctor.phone}</a></dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={16} className="shrink-0 text-text-light" />
            <dt className="sr-only">Email</dt>
            <dd className="truncate"><a href={`mailto:${doctor.email}`} className="hover:text-primary">{doctor.email}</a></dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={16} className="shrink-0 text-text-light" />
            <dt className="sr-only">Added</dt>
            <dd>Added {formatDate(doctor.createdAt)}</dd>
          </div>
        </dl>
        <div className="rounded-lg bg-primary-light px-6 py-3 text-center">
          <p className="font-poppins text-3xl font-semibold text-primary">{doctor.patientCount}</p>
          <p className="text-xs text-text-secondary">{doctor.patientCount === 1 ? "patient" : "patients"}</p>
        </div>
      </section>

      <h2 className="mb-3 font-poppins text-lg font-semibold text-secondary-dark">Patients</h2>

      <FilterBar
        search={params.search ?? ""}
        searchPlaceholder="Search name, phone, email or condition"
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

      <PatientTable
        data={data?.data ?? []}
        loading={isFetching}
        meta={meta}
        page={params.page ?? 1}
        limit={params.limit ?? 10}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onDelete={handleDelete}
      />

      <PatientFormModal open={addOpen} onClose={() => setAddOpen(false)} doctorId={doctor.id} />
      <DoctorFormModal open={editOpen} onClose={() => setEditOpen(false)} doctor={doctor} />
    </div>
  );
}
