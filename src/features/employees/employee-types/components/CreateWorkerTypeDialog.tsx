import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { RefObject } from "react";
import { DynamicFormModal } from "../../../../components/dynamic/DynamicFormModal";
import type { FieldConfig, GlobalFormRef } from "../../../../types/dinamicFormField";
import type { WorkerTypeInterface } from "../../interface/worker-type/type/worker-type-interface";


type CreateWorkerTypeDialogProps = {
  open: boolean;
  title?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  formRef: RefObject<GlobalFormRef<WorkerTypeInterface> | null>;
  record: FieldConfig<WorkerTypeInterface>[];
  defaultValues: WorkerTypeInterface;
  onClose: () => void;
  onSubmit: (values: WorkerTypeInterface) => Promise<void> | void;
};

export function CreateWorkerTypeDialog({
  open,
  title = "Crear tipo de trabajador",
  submitLabel = "Crear tipo",
  isSubmitting = false,
  formRef,
  record,
  defaultValues,
  onClose,
  onSubmit,
}: CreateWorkerTypeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>{title}</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <DynamicFormModal<WorkerTypeInterface>
          ref={formRef}
          record={record}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => void formRef.current?.submit()}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            minWidth: 150,
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: "#0f172a",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#1e293b",
              boxShadow: "none",
            },
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
