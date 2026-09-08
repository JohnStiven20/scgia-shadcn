import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider forcedTheme="light">
      <App/>
    </ThemeProvider>
  </StrictMode>
)
