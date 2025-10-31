"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Button, IconButton, Modal, TextField, Typography, Switch, FormControlLabel, CircularProgress } from "@mui/material"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { create_unit, delete_unit, get_all_units, update_unit } from "../../api/categories"
import { UnitOfMeasurement } from "../../Interfaces"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#FFFFFF",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
}

const Units = () => {
  const [units, setUnits] = useState<UnitOfMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasurement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    is_active: true,
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<UnitOfMeasurement | null>(null)
  const queryClient = useQueryClient()

  const fetchUnits = async () => {
    setLoading(true)
    try {
      const data = await get_all_units()
      setUnits(data)
    } catch (error) {
      toast.error("Error al cargar unidades de medición")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  const handleOpenModal = () => {
    setFormData({ name: "", abbreviation: "", is_active: true })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({ name: "", abbreviation: "", is_active: true })
  }

  const handleOpenEditModal = (unit: UnitOfMeasurement) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      abbreviation: unit.abbreviation || "",
      is_active: unit.is_active ?? true,
    })
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingUnit(null)
    setFormData({ name: "", abbreviation: "", is_active: true })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    try {
      await create_unit(formData)
      toast.success("Unidad de medición creada exitosamente")
      queryClient.invalidateQueries(["units"])
      fetchUnits()
      handleCloseModal()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al crear unidad de medición")
    }
  }

  const handleEditSubmit = async () => {
    if (!editingUnit || !formData.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    try {
      await update_unit(editingUnit.id!, formData)
      toast.success("Unidad de medición actualizada exitosamente")
      queryClient.invalidateQueries(["units"])
      fetchUnits()
      handleCloseEditModal()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al actualizar unidad de medición")
    }
  }

  const handleOpenDeleteModal = (unit: UnitOfMeasurement) => {
    setUnitToDelete(unit)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setUnitToDelete(null)
  }

  const handleDelete = async () => {
    if (!unitToDelete) return

    try {
      await delete_unit(unitToDelete.id!)
      toast.success("Unidad de medición eliminada exitosamente")
      queryClient.invalidateQueries(["units"])
      fetchUnits()
      handleCloseDeleteModal()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Error al eliminar unidad de medición"
      toast.error(errorMessage)
      if (error.response?.data?.unit) {
        // Si la unidad fue desactivada en lugar de eliminada
        fetchUnits()
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">Gestión de Unidades de Medición</Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            bgcolor: "#39A900",
            "&:hover": { bgcolor: "#2f6d30" },
          }}
        >
          Crear Unidad
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress sx={{ color: "#39A900" }} />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Abreviatura</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>
                    No hay unidades de medición disponibles
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>{unit.name}</td>
                    <td style={{ padding: "12px" }}>
                      {unit.abbreviation || <span style={{ color: "#999" }}>Sin abreviatura</span>}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: unit.is_active ? "#d4edda" : "#f8d7da",
                          color: unit.is_active ? "#155724" : "#721c24",
                        }}
                      >
                        {unit.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <IconButton
                        onClick={() => handleOpenEditModal(unit)}
                        sx={{ color: "#39A900" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteModal(unit)}
                        sx={{ color: "#d32f2f" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      )}

      {/* Modal para crear unidad */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Crear Nueva Unidad de Medición
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            placeholder="Ej: Kilogramo"
          />
          <TextField
            fullWidth
            label="Abreviatura"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            placeholder="Ej: kg"
          />
          <FormControlLabel
            control={
              <Switch
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            }
            label="Activa"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: "#39A900",
                "&:hover": { bgcolor: "#2f6d30" },
              }}
            >
              Crear
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para editar unidad */}
      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Editar Unidad de Medición
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Abreviatura"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            }
            label="Activa"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseEditModal}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              sx={{
                bgcolor: "#39A900",
                "&:hover": { bgcolor: "#2f6d30" },
              }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Confirmar Eliminación
          </Typography>
          <Typography sx={{ mb: 3 }}>
            ¿Estás seguro de que deseas eliminar la unidad "{unitToDelete?.name}"?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                bgcolor: "#d32f2f",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default Units

