import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ArrowDownToLine,
    ArrowUpToLine,
    ChevronDown,
    CornerUpLeft,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export const EmployeesTopNav = () => {

    const navigate = useNavigate()

    return (
        <TopBar>
            <nav
                className="hidden items-center gap-1 md:flex"
            >
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="ghost" />}
                    >
                        Operaciones <ChevronDown />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => { }}
                        >
                            <ArrowDownToLine />
                            Entradas
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => { }}
                        >
                            <ArrowUpToLine />
                            Salidas
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => { }}
                        >
                            <CornerUpLeft />
                            Retornos
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="ghost"
                    onClick={() => { 
                        navigate("models")
                    }}
                >
                    Modelos
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => { }}
                >
                    Productos
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        navigate("")
                    }}
                >
                    Trazabilidad
                </Button>
            </nav>
        </TopBar>
    )
}
