import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
import TableSystemGrid, { type MenuContext } from "../../../../components/dynamic/table/TableSystemGrid";
import { ConfirmDeleteDialog } from "../../../../components/dialog/ConfirmDeleteDialog";
import type { GlobalFormRef } from "../../../../types/dinamicFormField";
import { CreateWorkerTypeDialog } from "../components/CreateWorkerTypeDialog";
import { useGlobalError } from "../../../../hooks/useGlobalError";
import {
  useCreateWorkerTypeMutation,
  useDeleteWorkerTypeMutation,
  useGetWorkerTypesQuery,
  useUpdateWorkerTypeMutation,
} from "../api/workerTypeApi";
import { useCreateWorkerTypeFields } from "../ui/worker-tye.form";
import { workerTypeTableConfig } from "../ui/worker-type.table";
import type { WorkerTypeInterface } from "../../interface/worker-type/type/worker-type-interface";

function Icon({
  path,
  size = 20,
  color = "currentColor",
}: {
  path: string;
  size?: number;
  color?: string;
}) {
  return (
    <SvgIcon sx={{ fontSize: size, color }}>
      <path d={path} />
    </SvgIcon>
  );
}

export function WorkerTypesPage() {

  const { handleError } = useGlobalError();
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [workerTypeToDelete, setWorkerTypeToDelete] = useState<WorkerTypeInterface | null>(null);
  const [editingWorkerType, setEditingWorkerType] = useState<WorkerTypeInterface | null>(null);
  const formRefWorkerType = useRef<GlobalFormRef<WorkerTypeInterface> | null>(null);

  const [updateWorkerType, { isLoading: isUpdatingWorkerType }] = useUpdateWorkerTypeMutation();
  const [deleteWorkerType, { isLoading: isDeletingWorkerType }] = useDeleteWorkerTypeMutation();

  const {
    data: workerTypesPage,
    isLoading: isGettingWorkerTypes,
    error: workerTypesError,
    refetch: refetchWorkerTypes,
  } = useGetWorkerTypesQuery({
    page: 0,
    size: 50,
    sort: ["name,asc"],
  });

  const [createWorkerType, { isLoading: isCreatingWorkerType }] = useCreateWorkerTypeMutation();
  const rows = useMemo(() => workerTypesPage?.content ?? [], [workerTypesPage]);
  const workerTypeFields = useCreateWorkerTypeFields();

  const filteredRows = useMemo(() => {
    
    const value = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        value.length === 0 ||
        row.name.toLowerCase().includes(value) ||
        (row.description ?? "").toLowerCase().includes(value);

      return matchesSearch;
    });
  }, [rows, search]);

  const resetForm = () => {
    formRefWorkerType.current?.reset(editingWorkerType ?? { id: 0, name: "", description: "", active: true });
  };

  const handleOpenCreateDialog = () => {
    setEditingWorkerType(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (workerType: WorkerTypeInterface) => {
    setEditingWorkerType(workerType);
    formRefWorkerType.current?.reset(workerType);
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingWorkerType(null);
    resetForm();
  };

  const handleCreateWorkerType = async (values: WorkerTypeInterface) => {
    const normalizedName = values.name.trim();
    const normalizedDescription = (values.description ?? "").trim();

    try {
      await createWorkerType({
        name: normalizedName,
        description: normalizedDescription || null,
        active: values.active,
      }).unwrap();

      await refetchWorkerTypes();
      handleCloseCreateDialog();
    } catch (error) {
      handleError(error, "No se pudo crear el tipo de trabajador.");
    }
  };

  const handleUpdateWorkerType = async (values: WorkerTypeInterface) => {
    if (!editingWorkerType) {
      return;
    }

    const normalizedName = values.name.trim();
    const normalizedDescription = (values.description ?? "").trim();

    try {
      await updateWorkerType({
        id: editingWorkerType.id,
        request: {
          name: normalizedName,
          description: normalizedDescription || null,
          active: values.active,
        },
      }).unwrap();

      await refetchWorkerTypes();
      handleCloseCreateDialog();
    } catch (error) {
      handleError(error, "No se pudo actualizar el tipo de trabajador.");
    }
  };

  const handleDeleteWorkerType = async (workerType: WorkerTypeInterface) => {
    try {
      await deleteWorkerType({ id: workerType.id }).unwrap();
      await refetchWorkerTypes();
    } catch (error) {
      handleError(error, "No se pudo eliminar el tipo de trabajador.");
    }
  };

  const handleCloseDeleteDialog = () => {
    setWorkerTypeToDelete(null);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 84px)",
        backgroundColor: "#f8fafc",
      }}
    >
      <Box
        sx={{
          maxWidth: 1540,
          mx: "auto",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <Stack spacing={0}>
          <Box
            sx={{
              px: { xs: 2, md: 3.5 },
              py: { xs: 2.25, md: 2.8 },
            }}
          >
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={2.5}
              sx={{ alignItems: { xl: "center" }, justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Button
                  onClick={handleOpenCreateDialog}
                  variant="contained"
                  sx={{
                    minWidth: 118,
                    height: 44,
                    borderRadius: "10px",
                    px: 1.6,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(180deg, #18233b 0%, #0f172a 100%)",
                    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.1)",
                    "&:hover": {
                      background: "linear-gradient(180deg, #111827 0%, #020617 100%)",
                      boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
                    },
                  }}
                  startIcon={<Icon path="M19 11H13V5h-2v6H5v2h6v6h2v-6h6v-2Z" size={18} color="#ffffff" />}
                >
                  Nuevo
                </Button>

                <Typography sx={{ color: "#0f172a", fontSize: "0.98rem", fontWeight: 700 }}>
                  Tipos de trabajador
                </Typography>
              </Stack>

              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar..."
                size="small"
                sx={{
                  width: { xs: "100%", sm: 360 },
                  "& .MuiOutlinedInput-root": {
                    height: 44,
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon
                          path="m15.5 14-.79-.79-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28.79.79L20 20.49 21.49 19l-5.99-5ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
                          size={18}
                          color="#64748b"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 2, md: 3.5 }, pb: 3.5 }}>
            <Stack spacing={2.25}>
              {workerTypesError ? (
                <Alert severity="error">No se pudieron cargar los tipos de trabajador.</Alert>
              ) : null}

              {isGettingWorkerTypes ? (
                <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <Box
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    backgroundColor: "#ffffff",
                    overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <TableSystemGrid<WorkerTypeInterface>
                    rows={filteredRows}
                    formconfig={workerTypeTableConfig}
                    fluidColumns
                    onRowClick={(row) => handleOpenEditDialog(row)}
                    onMenu={(context: MenuContext<WorkerTypeInterface> | null) => (
                      <Menu
                        open={Boolean(context)}
                        onClose={() => context?.close()}
                        anchorReference="anchorPosition"
                        anchorPosition={
                          context ? { top: context.mouseY, left: context.mouseX } : undefined
                        }
                      >
                        <MenuItem
                          onClick={() => {
                            if (!context) {
                              return;
                            }

                            handleOpenEditDialog(context.row);
                            context.close();
                          }}
                        >
                          <ListItemIcon>
                            <SvgIcon fontSize="small">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.13 1.13 3.75 3.75 1.14-1.13Z" />
                            </SvgIcon>
                          </ListItemIcon>
                          <ListItemText primary="Editar" />
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            if (!context) {
                              return;
                            }

                            setWorkerTypeToDelete(context.row);
                            context.close();
                          }}
                          sx={{ color: "#b91c1c" }}
                        >
                          <ListItemIcon sx={{ color: "inherit" }}>
                            <SvgIcon fontSize="small">
                              <path d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 2h4v2H4V6h4l1-2Z" />
                            </SvgIcon>
                          </ListItemIcon>
                          <ListItemText primary="Eliminar" />
                        </MenuItem>
                      </Menu>
                    )}
                    defaultColumnFlex={1}
                    autoRowHeight
                    rowHeight={52}
                    columnHeaderHeight={46}
                    toolbarOptions={{
                      showSearch: false,
                      showColumns: false,
                      showExportCsv: false,
                      showPrint: false,
                      showFilters: false,
                    }}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <CreateWorkerTypeDialog
        open={isCreateDialogOpen}
        formRef={formRefWorkerType}
        record={workerTypeFields}
        defaultValues={editingWorkerType ?? { id: 0, name: "", description: "", active: true }}
        isSubmitting={isCreatingWorkerType || isUpdatingWorkerType || isDeletingWorkerType}
        title={editingWorkerType ? "Editar tipo de trabajador" : "Crear tipo de trabajador"}
        submitLabel={editingWorkerType ? "Guardar cambios" : "Crear tipo"}
        onClose={handleCloseCreateDialog}
        onSubmit={editingWorkerType ? handleUpdateWorkerType : handleCreateWorkerType}
      />

      <ConfirmDeleteDialog
        open={Boolean(workerTypeToDelete)}
        title="Eliminar tipo de trabajador"
        subtitle={
          workerTypeToDelete ? `Seguro que quieres eliminar "${workerTypeToDelete.name}"?` : undefined
        }
        loading={isDeletingWorkerType}
        onClose={handleCloseDeleteDialog}
        onDelete={async () => {
          if (!workerTypeToDelete) {
            return;
          }

          await handleDeleteWorkerType(workerTypeToDelete);
        }}
      />
    </Box>
  );
}
