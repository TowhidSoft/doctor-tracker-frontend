import { baseApi } from "@/redux/api/baseApi";

interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["auth"],
    }),
    getMe: builder.query<{ data: CurrentUser }, void>({
      query: () => ({ url: "/user", method: "GET" }),
      providesTags: ["auth"],
    }),
  }),
});

export const { useLoginUserMutation, useGetMeQuery } = authApi;
