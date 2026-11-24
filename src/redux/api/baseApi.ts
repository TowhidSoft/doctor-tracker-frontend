/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { logout, setAccessToken } from "../features/auth";
import { IS_DEMO } from "@/lib/demo/config";

// Typed locally: importing RootState here would make the store and baseApi types depend on each other.
type AuthState = { auth?: { accessToken?: string | null; refreshToken?: string | null } };

const baseQuery = fetchBaseQuery({

  // Must include the /api/v1 prefix (see .env.example).
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1",

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthState).auth?.accessToken;
    if (token) {
      headers.set("token", token); // ✅ Raw token only — no "Bearer"
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (IS_DEMO) {
    // Loaded on demand so production builds without NEXT_PUBLIC_DEMO never download the mock.
    const { handleDemoRequest } = await import("@/lib/demo/demoApi");
    return handleDemoRequest(args, api, extraOptions);
  }

  let result = await baseQuery(args, api, extraOptions);

  // ✅ Check for 401 (Unauthorized)
  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "/auth/refreshToken", // matches the backend route
        method: "POST",
        body: { refreshToken: (api.getState() as AuthState).auth?.refreshToken },
      },
      api,
      extraOptions
    );

    // The API wraps payloads: { status, message, data: { accessToken, refreshToken } }
    if ((refreshResult.data as any)?.data?.accessToken) {
      const newAccessToken = (refreshResult.data as any).data.accessToken;
      api.dispatch(setAccessToken(newAccessToken));
      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["auth", "doctor", "patient", "analytics"],
  endpoints: () => ({}),
});

export default baseApi;
