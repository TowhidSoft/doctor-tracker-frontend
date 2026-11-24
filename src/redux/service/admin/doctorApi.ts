import baseApi from "@/redux/api/baseApi";
import type { Gender } from "@/lib/validation";
import type { Patient, PatientListParams } from "./patientApi";

/* ================= TYPES ================= */

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  meta?: ApiMeta | null;
  data: T;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount: number;
}

export interface DoctorInput {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string | null;
  condition: string;
  notes?: string | null;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "name" | "specialization" | "hospital";
  sortOrder?: "asc" | "desc";
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

/** Drops empty values so they never reach the query string. */
export const cleanParams = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Partial<T>;

/* ================= ENDPOINTS ================= */

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<ApiResponse<Doctor[]>, DoctorListParams | void>({
      query: (params) => ({ url: "/doctors", method: "GET", params: cleanParams((params ?? {}) as DoctorListParams) }),
      providesTags: (result) => [
        { type: "doctor" as const, id: "LIST" },
        ...(result?.data ?? []).map((d) => ({ type: "doctor" as const, id: d.id })),
      ],
    }),

    getDoctorFilterOptions: builder.query<ApiResponse<DoctorFilterOptions>, void>({
      query: () => "/doctors/filter-options",
      providesTags: [{ type: "doctor", id: "OPTIONS" }],
    }),

    getDoctorById: builder.query<ApiResponse<Doctor>, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_r, _e, id) => [{ type: "doctor", id }],
    }),

    createDoctor: builder.mutation<ApiResponse<Doctor>, DoctorInput>({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      invalidatesTags: [
        { type: "doctor", id: "LIST" },
        { type: "doctor", id: "OPTIONS" },
        "analytics",
      ],
    }),

    updateDoctor: builder.mutation<ApiResponse<Doctor>, { id: string; body: Partial<DoctorInput> }>({
      query: ({ id, body }) => ({ url: `/doctors/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "doctor", id },
        { type: "doctor", id: "LIST" },
        { type: "doctor", id: "OPTIONS" },
        { type: "patient", id: "LIST" },
        "analytics",
      ],
    }),

    getDoctorPatients: builder.query<
      ApiResponse<Patient[]>,
      { id: string; params?: Omit<PatientListParams, "doctorId"> }
    >({
      query: ({ id, params }) => ({
        url: `/doctors/${id}/patients`,
        method: "GET",
        params: cleanParams((params ?? {}) as DoctorListParams),
      }),
      providesTags: (result, _e, { id }) => [
        { type: "patient" as const, id: `DOCTOR-${id}` },
        ...(result?.data ?? []).map((p) => ({ type: "patient" as const, id: p.id })),
      ],
    }),

    addPatientToDoctor: builder.mutation<ApiResponse<Patient>, { doctorId: string; body: PatientInput }>({
      query: ({ doctorId, body }) => ({ url: `/doctors/${doctorId}/patients`, method: "POST", body }),
      // A new patient changes: that doctor's list + count, the global patient list, filter options, analytics.
      invalidatesTags: (_r, _e, { doctorId }) => [
        { type: "doctor", id: doctorId },
        { type: "doctor", id: "LIST" },
        { type: "patient", id: `DOCTOR-${doctorId}` },
        { type: "patient", id: "LIST" },
        { type: "patient", id: "OPTIONS" },
        "analytics",
      ],
    }),

    deleteDoctorPatient: builder.mutation<ApiResponse<{ id: string }>, { doctorId: string; patientId: string }>({
      query: ({ doctorId, patientId }) => ({
        url: `/doctors/${doctorId}/patients/${patientId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { doctorId }) => [
        { type: "doctor", id: doctorId },
        { type: "doctor", id: "LIST" },
        { type: "patient", id: `DOCTOR-${doctorId}` },
        { type: "patient", id: "LIST" },
        { type: "patient", id: "OPTIONS" },
        "analytics",
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDoctorsQuery,
  useGetDoctorFilterOptionsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useGetDoctorPatientsQuery,
  useAddPatientToDoctorMutation,
  useDeleteDoctorPatientMutation,
} = doctorApi;
