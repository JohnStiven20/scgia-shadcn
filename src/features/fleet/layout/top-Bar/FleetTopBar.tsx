import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"





export const FleetTopBar = () => {

    const navigate = useNavigate()

    return (
        <TopBar>
            <nav
                className="flex min-w-max items-center gap-1 whitespace-nowrap"
            >
                <Button
                    variant="ghost"
                    onClick={() => { 
                        navigate("")
                    }}
                >
                    Flota
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => { }}
                >
                    Marcas
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        navigate("")
                    }}
                >
                    Modelos
                </Button>
            </nav>
        </TopBar>
    )
}
