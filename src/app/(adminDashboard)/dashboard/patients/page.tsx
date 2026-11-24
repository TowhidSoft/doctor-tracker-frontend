"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import { toast } from "sonner";
import PageHeader from "@/components/doctor-tracker/PageHeader";
import FilterBar, { FilterSelect } from "@/components/doctor-tracker/FilterBar";
import PatientTable from "@/components/doctor-tracker/PatientTable";
import PatientFormModal from "@/components/doctor-tracker/PatientFormModal";
import { useListParams } from "@/hooks/useListParams";
import { getErrorMessage } from "@/lib/errors";
import { GENDERS } from "@/lib/validation";
import {
  Patient,
  PatientListParams,
  useDeletePatientMutation,
  useGetPatientFilterOptionsQuery,
  useGetPatientsQuery,
} from "@/redux/service/admin/patientApi";

const INITIAL: PatientListParams = { page: 1, limit: 10, search: "", sortBy: "createdAt", sortOrder: "desc" };

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Age: youngest first", value: "age:asc" },
  { label: "Age: oldest first", value: "age:desc" },
  { label: "Condition A–Z", value: "condition:asc" },
];

const GENDER_OPTIONS = GENDERS.map((g) => ({ label: g, value: g }));

export default function PatientsPage() {
  const [modal, modalHolder] = Modal.useModal();
  // `editing` is kept after close so the modal does not flip to "Add" while it animates out.
  const [editing, setEditing] = useState<Patient | undefined>();
  const [editOpen, setEditOpen] = useState(false);

  const list = useListParams<PatientListParams>(INITIAL);
  const { params, setFilter, setSearch, setDateRange, setSort, setPage, setLimit, clampPage, reset, isDirty, sortValue } = list;

  const { data, isFetching } = useGetPatientsQuery(params);
  const { data: options, isLoading: optionsLoading } = useGetPatientFilterOptionsQuery();
  const [deletePatient] = useDeletePatientMutation();

  const meta = data?.meta;
  useEffect(() => {
    if (meta) clampPage(meta.totalPages);
  }, [meta, clampPage]);

  const doctorOptions = useMemo(
    () => (options?.data.doctors ?? []).map((d) => ({ label: d.name, value: d.id })),
    [options],
  );

  const onCondition = useCallback((v?: string) => setFilter("condition", v), [setFilter]);
  const onGender = useCallback((v?: string) => setFilter("gender", v as PatientListParams["gender"]), [setFilter]);
  const onDoctor = useCallback((v?: string) => setFilter("doctorId", v), [setFilter]);

  const selects = useMemo<FilterSelect[]>(
    () => [
      { key: "condition", placeholder: "Condition", value: params.condition, options: (options?.data.conditions ?? []).map((c) => ({ label: c, value: c })), loading: optionsLoading, onChange: onCondition },
      { key: "gender", placeholder: "Gender", value: params.gender, options: GENDER_OPTIONS, onChange: onGender },
      { key: "doctor", placeholder: "Doctor", value: params.doctorId, options: doctorOptions, loading: optionsLoading, onChange: onDoctor },
    ],
    [params.condition, params.gender, params.doctorId, options, doctorOptions, optionsLoading, onCondition, onGender, onDoctor],
  );

  const handleEdit = useCallback((patient: Patient) => {
    setEditing(patient);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    (patient: Patient) => {
      modal.confirm({
        title: `Delete ${patient.name}?`,
        content: "This permanently removes the patient record. You can't undo it.",
        okText: "Delete patient",
        okButtonProps: { danger: true },
        cancelText: "Keep patient",
        onOk: async () => {
          try {
            await deletePatient(patient.id).unwrap();
            toast.success("Patient deleted");
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        },
      });
    },
    [modal, deletePatient],
  );

  return (
    <div>
      {modalHolder}
      <PageHeader title="Patients" description="Every patient across all doctors. Add new patients from a doctor's page." />

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
        showDoctor
        data={data?.data ?? []}
        loading={isFetching}
        meta={meta}
        page={params.page ?? 1}
        limit={params.limit ?? 10}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PatientFormModal
        open={editOpen}
        patient={editing}
        doctorOptions={doctorOptions}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
