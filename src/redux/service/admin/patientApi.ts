import baseApi from "@/redux/api/baseApi";
import type { Gender } from "@/lib/validation";
import { cleanParams } from "./doctorApi";
import type { ApiResponse, PatientInput } from "./doctorApi";

/* ================= TYPES ================= */

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string | null;
  condition: string;
  notes: string | null;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
  doctor: { id: string; name: string; specialization: string };
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  gender?: Gender;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "name" | "age" | "condition";
  sortOrder?: "asc" | "desc";
}

export interface PatientFilterOptions {
  conditions: string[];
  doctors: { id: string; name: string }[];
}

/* ================= ENDPOINTS ================= */

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<ApiResponse<Patient[]>, PatientListParams | void>({
      query: (params) => ({ url: "/patients", method: "GET", params: cleanParams((params ?? {}) as PatientListParams) }),
      providesTags: (result) => [
        { type: "patient" as const, id: "LIST" },
        ...(result?.data ?? []).map((p) => ({ type: "patient" as const, id: p.id })),
      ],
    }),

    getPatientFilterOptions: builder.query<ApiResponse<PatientFilterOptions>, void>({
      query: () => "/patients/filter-options",
      providesTags: [{ type: "patient", id: "OPTIONS" }],
    }),

    updatePatient: builder.mutation<
      ApiResponse<Patient>,
      { id: string; body: Partial<PatientInput> & { doctorId?: string } }
    >({
      query: ({ id, body }) => ({ url: `/patients/${id}`, method: "PATCH", body }),
      // Reassigning a patient moves counts between doctors and between per-doctor lists,
      // so invalidate whole tag types rather than single ids.
      invalidatesTags: ["patient", "doctor", "analytics"],
    }),

    deletePatient: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: ["patient", "doctor", "analytics"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPatientsQuery,
  useGetPatientFilterOptionsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
