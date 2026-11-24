import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import baseApi from "@/redux/api/baseApi";
import { logout } from "@/redux/features/auth";

/** Clears auth state, drops every cached API response (so the next user never sees stale data) and goes to /login. */
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useCallback(() => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    router.replace("/login");
  }, [dispatch, router]);
}
