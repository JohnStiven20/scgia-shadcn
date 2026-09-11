import { InventoryPageHeader } from "@/features/inventory/components"

export function AbsencesPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="flex flex-col gap-6">
      <InventoryPageHeader title={title} description={description} />
      <p className="text-sm text-muted-foreground">Esta sección estará disponible próximamente.</p>
    </section>
  )
}
