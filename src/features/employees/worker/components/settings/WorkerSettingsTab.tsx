import { Info, Link2, Unlink, UserRound } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import {
  useAssignWorkerToAccountMutation,
  useFindTop5AccountsByUsernameQuery,
} from "@/api/commonApi"
import { SelectFieldRHF } from "@/components/form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGlobalError } from "@/hooks"
import type {
  WorkerSystemAccount,
} from "../../interface/types/workerSettings"

type WorkerSettingsTabProps = {
  workerId: number
  currentAccount?: WorkerSystemAccount | null
}

type WorkerAccountFormValues = {
  accountId: number | null
}

export function WorkerSettingsTab({
  workerId,
  currentAccount = null,
}: WorkerSettingsTabProps) {
  const [accountSearch, setAccountSearch] = useState("")
  const [linkedAccount, setLinkedAccount] =
    useState<WorkerSystemAccount | null>(currentAccount)
  const { data: accounts = [], isFetching: isFetchingAccounts } =
    useFindTop5AccountsByUsernameQuery({
      search: accountSearch,
    })
  const [assignWorkerToAccount, { isLoading: isAssigningAccount }] =
    useAssignWorkerToAccountMutation()
  const { handleError } = useGlobalError()
  const notifications = useNotifications()
  const form = useForm<WorkerAccountFormValues>({
    defaultValues: {
      accountId: currentAccount?.id ?? null,
    },
  })
  const selectedAccountId = useWatch({
    control: form.control,
    name: "accountId",
  })
  const accountOptions = useMemo(() => {
    return accounts.map((account) => ({
      label: account.username,
      value: account.id,
      account: {
        id: account.id,
        username: account.username,
        status: "Activa" as const,
      },
    }))
  }, [accounts])
  const selectedAccount = useMemo(() => {
    return (
      accountOptions.find((option) => option.value === selectedAccountId)
        ?.account ?? null
    )
  }, [accountOptions, selectedAccountId])

  async function handleSubmit(values: WorkerAccountFormValues) {
    const nextAccount =
      accountOptions.find((option) => option.value === values.accountId)
        ?.account ?? null

    if (!nextAccount) {
      return
    }

    try {
      await assignWorkerToAccount({
        accountId: nextAccount.id,
        workerId,
      }).unwrap()
      setLinkedAccount(nextAccount)
      notifications.success("Cuenta vinculada correctamente.")
    } catch (error) {
      handleError(error, "No se ha podido vincular la cuenta.")
    }
  }

  async function handleUnlinkAccount() {
    if (!linkedAccount) {
      return
    }

    try {
      await assignWorkerToAccount({
        accountId: linkedAccount.id,
        workerId: null,
      }).unwrap()
      setLinkedAccount(null)
      form.setValue("accountId", null)
      notifications.success("Cuenta desvinculada correctamente.")
    } catch (error) {
      handleError(error, "No se ha podido desvincular la cuenta.")
    }
  }

  return (
    <section className="grid gap-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">AJUSTES</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configuracion y datos adicionales del trabajador.
        </p>
      </header>

      <Card className="py-0">
        <CardHeader className="border-b p-5">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold">
                Cuenta del sistema
              </CardTitle>
              <CardDescription className="mt-1">
                Cuenta de acceso vinculada al trabajador.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form
            className="grid gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(18rem,1fr)_14rem]"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <SelectFieldRHF
              name="accountId"
              label="Cuenta"
              control={form.control}
              options={accountOptions}
              placeholder="Selecciona una cuenta"
              searchPlaceholder="Buscar cuenta..."
              searchValue={accountSearch}
              isLoading={isFetchingAccounts}
              emptyText="No hay cuentas disponibles"
              onSearchChange={setAccountSearch}
              disabled={isAssigningAccount}
            />

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {linkedAccount
                      ? linkedAccount.username
                      : "Sin cuenta vinculada"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {linkedAccount
                      ? linkedAccount.email || linkedAccount.role
                        ? `${linkedAccount.email ?? "Sin email"} - ${
                            linkedAccount.role ?? "Sin rol"
                          }`
                        : `Cuenta #${linkedAccount.id}`
                      : "Este trabajador no tiene una cuenta de acceso al sistema."}
                  </p>
                  {linkedAccount ? (
                    <Badge variant="outline" className="mt-3">
                      {linkedAccount.status ?? "Activa"}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid content-start gap-2">
              <Button
                type="submit"
                disabled={!selectedAccount || isAssigningAccount}
              >
                <Link2 />
                {isAssigningAccount ? "Vinculando..." : "Vincular cuenta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!linkedAccount || isAssigningAccount}
                onClick={handleUnlinkAccount}
              >
                <Unlink />
                Desvincular
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
