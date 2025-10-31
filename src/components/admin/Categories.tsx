"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Button, IconButton, Modal, TextField, Typography, Switch, FormControlLabel, CircularProgress } from "@mui/material"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { create_category, delete_category, get_all_categories, update_category } from "../../api/categories"
import { ProductCategory } from "../../Interfaces"

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

const Categories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null)
  const queryClient = useQueryClient()

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await get_all_categories()
      setCategories(data)
    } catch (error) {
      toast.error("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = () => {
    setFormData({ name: "", description: "", is_active: true })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({ name: "", description: "", is_active: true })
  }

  const handleOpenEditModal = (category: ProductCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active ?? true,
    })
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "", is_active: true })
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
      await create_category(formData)
      toast.success("Categoría creada exitosamente")
      queryClient.invalidateQueries(["categories"])
      fetchCategories()
      handleCloseModal()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al crear categoría")
    }
  }

  const handleEditSubmit = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    try {
      await update_category(editingCategory.id!, formData)
      toast.success("Categoría actualizada exitosamente")
      queryClient.invalidateQueries(["categories"])
      fetchCategories()
      handleCloseEditModal()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al actualizar categoría")
    }
  }

  const handleOpenDeleteModal = (category: ProductCategory) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      await delete_category(categoryToDelete.id!)
      toast.success("Categoría eliminada exitosamente")
      queryClient.invalidateQueries(["categories"])
      fetchCategories()
      handleCloseDeleteModal()
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Error al eliminar categoría"
      toast.error(errorMessage)
      if (error.response?.data?.category) {
        // Si la categoría fue desactivada en lugar de eliminada
        fetchCategories()
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">Gestión de Categorías</Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            bgcolor: "#39A900",
            "&:hover": { bgcolor: "#2f6d30" },
          }}
        >
          Crear Categoría
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
                <th style={{ padding: "12px", textAlign: "left" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>
                    No hay categorías disponibles
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>{category.name}</td>
                    <td style={{ padding: "12px" }}>
                      {category.description || <span style={{ color: "#999" }}>Sin descripción</span>}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: category.is_active ? "#d4edda" : "#f8d7da",
                          color: category.is_active ? "#155724" : "#721c24",
                        }}
                      >
                        {category.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <IconButton
                        onClick={() => handleOpenEditModal(category)}
                        sx={{ color: "#39A900" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteModal(category)}
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

      {/* Modal para crear categoría */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Crear Nueva Categoría
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
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
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

      {/* Modal para editar categoría */}
      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Editar Categoría
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
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
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
            ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name}"?
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

export default Categories

