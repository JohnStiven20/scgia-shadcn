import { RouterProvider } from "react-router-dom"

import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap"
import { AppRouter } from "./router/AppRouter"

export function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={AppRouter}></RouterProvider>
    </AuthBootstrap>
  )
}

export default App
