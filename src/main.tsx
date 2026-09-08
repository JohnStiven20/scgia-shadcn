import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider"
import { store } from "@/store/store"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider forcedTheme="light">
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
