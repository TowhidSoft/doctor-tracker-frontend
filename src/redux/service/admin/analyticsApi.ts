import baseApi from "@/redux/api/baseApi";
import type { ApiResponse } from "./doctorApi";
import type { Patient } from "./patientApi";

export type AnalyticsRange = 7 | 30 | 90;

export interface AnalyticsOverview {
  totals: {
    doctors: number;
    patients: number;
    avgPatientsPerDoctor: number;
    newPatients: number;
    newDoctors: number;
  };
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; count: number }[];
  timeline: { date: string; patients: number; doctors: number }[];
  conditions: { name: string; count: number }[];
  gender: { name: string; count: number }[];
  specializations: { name: string; count: number }[];
  recentPatients: Patient[];
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query<ApiResponse<AnalyticsOverview>, { days: AnalyticsRange }>({
      query: (params) => ({ url: "/analytics/overview", method: "GET", params }),
      providesTags: ["analytics"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAnalyticsOverviewQuery } = analyticsApi;
