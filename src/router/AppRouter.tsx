import { createBrowserRouter, Navigate } from "react-router-dom"
import { EmployeesLayout } from "@/features/employees/layout/EmployeesLayout";
import { AppLayout } from "@/layout/Layout";
import { EmployeesPage } from "@/features/employees/users/EmployeesPage";



export const AppRouter = createBrowserRouter([
    
    {
        path: "/",
        element: <AppLayout/>,
        children: [
            {
                path: "admin",
                element: <EmployeesLayout/>,
                children: [
                    {
                        path: "users",
                        element: <EmployeesPage/>
                    }
                ]
            }
        ]
    }
]);
