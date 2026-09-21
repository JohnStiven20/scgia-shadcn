import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import type { AppDispatch } from "@/store/store"
import { clearAuth } from "../store/authSlice"

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  return useCallback(() => {
    dispatch(clearAuth())
    navigate("/login", { replace: true })
  }, [dispatch, navigate])
}
