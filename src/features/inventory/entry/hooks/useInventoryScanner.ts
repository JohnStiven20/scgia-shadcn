import { useEffect, useRef } from "react"
import onScan from "onscan.js"

type UseInventoryScannerOptions = {
  onScanCode: (rawCode: string) => void | Promise<void>
  enabled?: boolean
}

export function useInventoryScanner({
  onScanCode,
  enabled = true,
}: UseInventoryScannerOptions) {

  const onScanCodeRef = useRef(onScanCode)

  useEffect(() => {
    onScanCodeRef.current = onScanCode
  }, [onScanCode])

  useEffect(() => {
    if (!enabled) return

    const scanTarget = document

    onScan.attachTo(scanTarget, {
      // A scanner sends several characters almost instantaneously. This
      // prevents regular keyboard typing from being treated as a scan.
      minLength: 3,
      avgTimeByChar: 20,
      suffixKeyCodes: [9, 13],
      preventDefault: true,
      stopPropagation: true,
      onScan: (scannedCode) => {
        void onScanCodeRef.current(scannedCode)
        console.log(scannedCode);
      },
      onScanError: (scannedCode) => {
        console.log(scannedCode)
      },
    })

    return () => {
      if (onScan.isAttachedTo(scanTarget)) {
        onScan.detachFrom(scanTarget)
      }
    }
  }, [enabled])
}
