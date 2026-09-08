import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { AppRouter } from "./router/AppRouter.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { RouterProvider } from "react-router-dom"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App/>
    </ThemeProvider>
  </StrictMode>
)
