declare module "onscan.js" {
  interface OnScanOptions {
    onScan: (scannedCode: string, quantity: number) => void
    onScanError?: (debug: unknown) => void
    minLength?: number
    suffixKeyCodes?: number[]
    ignoreIfFocusOn?: string | EventTarget
    preventDefault?: boolean
    stopPropagation?: boolean
    captureEvents?: boolean
    reactToPaste?: boolean
  }

  interface OnScan {
    attachTo(element: EventTarget, options: OnScanOptions): OnScan
    detachFrom(element: EventTarget): void
    isAttachedTo(element: EventTarget): boolean
  }

  const onScan: OnScan
  export default onScan
}

