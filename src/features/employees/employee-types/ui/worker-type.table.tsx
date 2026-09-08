import { Box, Typography } from "@mui/material";
import type { FieldConfig } from "../../../../types/dinamicFormField";
import type { WorkerTypeInterface } from "../../interface/worker-type/type/worker-type-interface";

export const workerTypeTableConfig: FieldConfig<WorkerTypeInterface>[] = [
  {
    key: "id",
    label: "#",
    type: "text",
    table: {
      label: "#",
      editable: false,
      minWidth: 52,
      maxWidth: 52,
      renderCell: ({ row }) => (
        <Typography sx={{ color: "#0f172a", fontSize: "0.92rem", fontWeight: 500 }}>
          {row.id}
        </Typography>
      ),
    },
  },
  {
    key: "name",
    label: "Tipo de trabajador",
    type: "text",
    table: {
      label: "Tipo de trabajador",
      editable: false,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Typography sx={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 500 }} noWrap>
          {row.name}
        </Typography>
      ),
    },
  },
  {
    key: "description",
    label: "Descripcion",
    type: "text",
    table: {
      label: "Descripcion",
      editable: false,
      minWidth: 260,
      renderCell: ({ row }) => (
        <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 400 }} noWrap>
          {row.description || "Sin descripcion"}
        </Typography>
      ),
    },
  },
  {
    key: "active",
    label: "Estado",
    type: "text",
    table: {
      label: "Estado",
      editable: false,
      minWidth: 120,
      renderCell: ({ row }) => {
        const isActive = Boolean(row.active);
        const tint = isActive ? { color: "#16a34a" } : { color: "#f59e0b" };

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.65,
              color: tint.color,
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "currentColor" }} />
            {isActive ? "Activo" : "Inactivo"}
          </Box>
        );
      },
    },
  },
];
