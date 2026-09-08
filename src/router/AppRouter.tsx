import { createBrowserRouter, Navigate } from "react-router-dom"
import { EmployeesLayout } from "@/features/employees/layout/EmployeesLayout";
import { AppLayout } from "@/layout/Layout";
import { EmployeesPage } from "@/features/employees/layout/page/EmployeesPage";
import { WorkerPage } from "@/features/employees/worker/page/WorkerPage";



export const AppRouter = createBrowserRouter([
    
    {
        path: "/",
        element: <AppLayout/>,
        children: [
            {
                path: "employees",
                element: <EmployeesLayout/>,
                children: [
                    {
                        index: true,
                        element: <EmployeesPage/>
                    },
                    {
                        path: "worker/:id",
                        element: <WorkerPage/>
                    }
                   
                ]
            }
        ]
    }
]);
