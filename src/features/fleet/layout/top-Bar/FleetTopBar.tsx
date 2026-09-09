import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"





export const FleetTopBar = () => {

    const navigate = useNavigate()

    return (
        <TopBar>
            <nav
                className="hidden items-center gap-1 md:flex"
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