import { RouterProvider } from "react-router-dom"

import { AppRouter } from "./router/AppRouter"

export function App() {
  return <RouterProvider router={AppRouter}></RouterProvider>
}

export default App
