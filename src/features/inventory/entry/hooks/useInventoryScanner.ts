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
      minLength: 1,
      suffixKeyCodes: [9, 13],
      ignoreIfFocusOn: "input, textarea, [contenteditable='true']",
      preventDefault: true,
      stopPropagation: true,
      onScan: (scannedCode) => {
        void onScanCodeRef.current(scannedCode)
      },
    })

    return () => {
      if (onScan.isAttachedTo(scanTarget)) {
        onScan.detachFrom(scanTarget)
      }
    }
  }, [enabled])
}
