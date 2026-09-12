import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import { ExternalLink, LoaderCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrency } from "@/utils/currencyUtils"
import { formatDate } from "@/utils/dateUtils"
import type { WorkerContract } from "@/features/interface/worker-contract/type/worker-contract.interface"

import {
  getContractReference,
  getContractType,
  getSalaryPeriodLabel,
  getSalaryTypeLabel,
} from "./contractPresentation"
import { contractEmployer } from "./contractTemplateConfig"

type ContractTemplatePreviewProps = {
  contract: WorkerContract
  workerName: string
  workerDni: string
  onPdfUrlChange?: (url: string | null) => void
}

type ContractPdfDocumentProps = ContractTemplatePreviewProps & {
  highlighted: boolean
}

const pdfStyles = StyleSheet.create({
  page: {
    padding: 48,
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.55,
  },
  header: {
    borderBottom: "1 solid #D1D5DB",
    paddingBottom: 18,
    textAlign: "center",
  },
  employer: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
  },
  title: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  reference: {
    marginTop: 6,
    color: "#4B5563",
    fontSize: 9,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  paragraph: {
    marginBottom: 8,
  },
  clause: {
    marginBottom: 8,
  },
  variable: {
    backgroundColor: "#FEF3C7",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 48,
    paddingTop: 24,
    borderTop: "1 solid #D1D5DB",
  },
  signature: {
    width: "42%",
    textAlign: "center",
    fontSize: 9,
  },
  signatureLine: {
    height: 28,
    marginBottom: 6,
    borderBottom: "1 solid #6B7280",
  },
  muted: {
    color: "#6B7280",
  },
})

function PdfVariable({
  children,
  highlighted,
}: {
  children: React.ReactNode
  highlighted: boolean
}) {
  return (
    <Text style={highlighted ? pdfStyles.variable : undefined}>{children}</Text>
  )
}

function ContractPdfDocument({
  contract,
  workerName,
  workerDni,
  highlighted,
}: ContractPdfDocumentProps) {
  const reference = getContractReference(contract)
  const contractType = getContractType(contract)
  const startDate = formatDate(contract.startDate)
  const endDate = contract.endDate ? formatDate(contract.endDate) : null

  return (
    <Document
      title={`Contrato ${reference}`}
      author={contractEmployer.legalName}
    >
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.employer}>{contractEmployer.legalName}</Text>
          <Text style={pdfStyles.title}>
            Contrato de trabajo {contractType.toLowerCase()}
          </Text>
          <Text style={pdfStyles.reference}>Referencia: {reference}</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Reunidos</Text>
          <Text style={pdfStyles.paragraph}>
            De una parte,{" "}
            <PdfVariable highlighted={highlighted}>
              {contractEmployer.representativeName}
            </PdfVariable>
            , en representación de {contractEmployer.legalName}, con CIF{" "}
            {contractEmployer.taxId} y domicilio en {contractEmployer.address},
            en adelante, la empresa.
          </Text>
          <Text style={pdfStyles.paragraph}>
            De otra parte,{" "}
            <PdfVariable highlighted={highlighted}>{workerName}</PdfVariable>,
            con DNI{" "}
            <PdfVariable highlighted={highlighted}>
              {workerDni || "pendiente de informar"}
            </PdfVariable>
            , en adelante, la persona trabajadora.
          </Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Cláusulas</Text>
          <Text style={pdfStyles.clause}>
            1. La persona trabajadora prestará servicios como{" "}
            <PdfVariable highlighted={highlighted}>
              {contract.employeeType || "empleado/a"}
            </PdfVariable>{" "}
            para {contractEmployer.legalName}.
          </Text>
          <Text style={pdfStyles.clause}>
            2. El contrato tendrá carácter{" "}
            <PdfVariable highlighted={highlighted}>
              {contractType.toLowerCase()}
            </PdfVariable>{" "}
            y comenzará el{" "}
            <PdfVariable highlighted={highlighted}>{startDate}</PdfVariable>
            {endDate ? (
              <>
                {" "}
                hasta el{" "}
                <PdfVariable highlighted={highlighted}>{endDate}</PdfVariable>.
              </>
            ) : (
              "."
            )}
          </Text>
          <Text style={pdfStyles.clause}>
            3. La jornada será de{" "}
            <PdfVariable highlighted={highlighted}>
              {contract.weeklyHours} horas semanales
            </PdfVariable>
            .
          </Text>
          <Text style={pdfStyles.clause}>
            4. La retribución bruta será de{" "}
            <PdfVariable highlighted={highlighted}>
              {formatCurrency(contract.salaryAmount)}
            </PdfVariable>
            , con carácter{" "}
            <PdfVariable highlighted={highlighted}>
              {getSalaryTypeLabel(contract.salaryType).toLowerCase()}
            </PdfVariable>{" "}
            y período{" "}
            <PdfVariable highlighted={highlighted}>
              {getSalaryPeriodLabel(contract.salaryPeriod).toLowerCase()}
            </PdfVariable>
            .
          </Text>
        </View>

        <View style={pdfStyles.signatures}>
          <View style={pdfStyles.signature}>
            <View style={pdfStyles.signatureLine} />
            <Text>{contractEmployer.legalName}</Text>
            <Text style={pdfStyles.muted}>La empresa</Text>
          </View>
          <View style={pdfStyles.signature}>
            <View style={pdfStyles.signatureLine} />
            <Text>{workerName}</Text>
            <Text style={pdfStyles.muted}>La persona trabajadora</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export function ContractTemplatePreview({
  contract,
  workerName,
  workerDni,
  onPdfUrlChange,
}: ContractTemplatePreviewProps) {
  const [highlighted, setHighlighted] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [hasError, setHasError] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    let isActive = true
    let generatedUrl: string | null = null

    function blobToDataUrl(blob: Blob) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    }

    async function generatePdf() {
      setIsGenerating(true)
      setHasError(false)
      setPdfUrl(null)
      onPdfUrlChange?.(null)

      try {
        const blob = await pdf(
          <ContractPdfDocument
            contract={contract}
            workerName={workerName}
            workerDni={workerDni}
            highlighted={highlighted}
          />
        ).toBlob()

        if (!isActive) return

        generatedUrl = isMobile
          ? await blobToDataUrl(blob)
          : URL.createObjectURL(blob)
        setPdfUrl(generatedUrl)
        onPdfUrlChange?.(generatedUrl)
      } catch {
        if (isActive) setHasError(true)
      } finally {
        if (isActive) setIsGenerating(false)
      }
    }

    void generatePdf()

    return () => {
      isActive = false
      if (generatedUrl?.startsWith("blob:")) URL.revokeObjectURL(generatedUrl)
      onPdfUrlChange?.(null)
    }
  }, [contract, highlighted, isMobile, onPdfUrlChange, workerDni, workerName])

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b py-4">
        <div>
          <CardTitle className="text-base font-semibold">Contrato</CardTitle>
          <p className="text-xs text-muted-foreground">
            PDF temporal generado en memoria con los datos del contrato.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles /> Datos dinámicos
          </Badge>
          <Switch checked={highlighted} onCheckedChange={setHighlighted} />
          <span className="sr-only">Destacar datos dinámicos</span>
        </label>
      </CardHeader>
      <CardContent className="space-y-3 bg-muted/30 p-3 sm:p-5">
        <p className="text-xs text-muted-foreground">
          {isGenerating
            ? "Generando PDF..."
            : hasError
              ? "No se pudo generar el PDF."
              : "Previsualización PDF"}
        </p>
        <div className="overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10">
          {pdfUrl ? (
            isMobile ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                <div className="rounded-full bg-muted p-4 text-muted-foreground">
                  <ExternalLink className="size-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">PDF listo para visualizar</p>
                  <p className="text-sm text-muted-foreground">
                    El navegador móvil abrirá el documento en su visor PDF.
                  </p>
                </div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`contrato-${getContractReference(contract)}.pdf`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="size-4" />
                  Abrir PDF
                </a>
              </div>
            ) : (
              <iframe
                src={pdfUrl}
                title={`Previsualización del contrato ${getContractReference(contract)}`}
                className="h-[680px] w-full bg-background sm:h-[800px]"
              />
            )
          ) : (
            <div className="relative h-[680px] sm:h-[800px]">
              <Skeleton className="absolute inset-0 rounded-none" />
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="animate-spin" /> Generando
                    documento...
                  </span>
                ) : (
                  "No hay previsualización disponible."
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
