"use client"

import type React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material"
import Pagination from "@mui/material/Pagination"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { delete_product, edit_product, get_all_products_paginated, get_solo_prod } from "../../api/products"
import { get_solo_user } from "../../api/users"
import "./../../global/style.css"
import { EditIcon } from "lucide-react"

interface Props {
  results: any[] // Adjust the type of 'results' as needed
}

const Products = ({ results }: Props) => {
  const [page, setPage] = useState(1)
  const [dataLenght, setDataLenght] = useState(0)
  const [data, setData] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [idOption, setIdOption] = useState<number | null>(null)
  const [dataUser, setDataUser] = useState<any[]>([])
  const queryClient = useQueryClient()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    count_in_stock: 0,
    category: "",
    price: 0,
    unit: "",
    map_locate: "",
    image: null as File | null,
  })

  // Función para abrir el modal de edición
  const handleOpenEditModal = async (productId: number) => {
    try {
      const response = await get_solo_prod(productId)
      setEditingProduct(response)
      setFormData({
        name: response.name,
        description: response.description,
        count_in_stock: response.count_in_stock,
        category: response.category,
        price: response.price,
        unit: response.unit,
        map_locate: response.map_locate,
        image: null,
      })
      setEditModalOpen(true)
      toast.success("Producto cargado para edición")
    } catch (e) {
      toast.error("Error al cargar el producto para edición")
    }
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      count_in_stock: 0,
      category: "",
      price: 0,
      unit: "",
      map_locate: "",
      image: null,
    })
  }

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "count_in_stock" || name === "price" ? Number(value) : value,
    }))
  }

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }))
    }
  }

  // Función para enviar la edición
  const handleEditSubmit = async () => {
    if (!editingProduct) return
  
    try {
      let imageBase64: string | null = null
  
      // Convertir la imagen a base64 si existe
      if (formData.image) {
        const reader = new FileReader()
        const imageLoaded = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === "string") {
              resolve(reader.result)
            } else {
              reject("Error al convertir la imagen a base64")
            }
          }
          reader.onerror = () => reject("Error de lectura del archivo")
        })
  
        reader.readAsDataURL(formData.image)
        imageBase64 = await imageLoaded
      }
      const productToUpdate = {
        ...editingProduct,
        ...formData,
        id: editingProduct.id,
        image: imageBase64, // Se envía en base64 si existe
      }
  
      await edit_product(productToUpdate)
      toast.success("Producto actualizado con éxito")
      queryClient.invalidateQueries(["products"])
      fetchProductos(page)
      handleCloseEditModal()
    } catch (error) {
      toast.error("Error al actualizar el producto")
    }
  }
  

  const handleOpen = (id: number) => {
    setIdOption(id)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)
  const handleCloseModal = () => setModalOpen(false)

  const handleOpenModal = async (user: any) => {
    try {
      const response = await get_solo_user(user)
      setDataUser(response)
      toast.success("Usuario cargado con éxito")
    } catch (e) {
      toast.error("Error al cargar al usuario")
    }
    setModalOpen(true)
  }

  const confirmarEliminar = async () => {
    if (idOption !== null) {
      try {
        await delete_product(idOption)
        toast.success("Producto eliminado con éxito!")
        queryClient.invalidateQueries(["products"])
        fetchProductos(page)
      } catch (e: any) {
        toast.error("Error al eliminar el producto")
      } finally {
        setOpen(false) // Cierra el modal después de confirmar
      }
    }
  }

  const fetchProductos = async (page: number) => {
    try {
      const productosAPI = await get_all_products_paginated(page)
      setData(productosAPI.data)
      setDataLenght(productosAPI.meta.count)
    } catch (error) {
      toast.error("Error al cargar los productos")
    }
  }

  useEffect(() => {
    fetchProductos(page)
  }, [page])

  function formatearFecha(fechaISO: any) {
    const fecha = new Date(fechaISO)
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const dia = fecha.getDate()
    const mes = meses[fecha.getMonth()]
    const year = fecha.getFullYear()
    return `${dia} de ${mes} del ${year}`
  }

  return (
    <div className="overflow-x-auto scroll-tablas">
      <h2 className="text-xl font-semibold my-3 text-center text-black">Lista de productos</h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-2 py-2 text-center">
              Nombre
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Categoria
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Localización
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Precio
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Unidad
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Opiniones
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Calificación
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Fecha de creación
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              Publicado
            </th>
          </tr>
        </thead>
        {data && data.length > 0 ? (
          <tbody>
            {data.map((o: any) => (
              <tr
                key={o.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600"
              >
                <td className="px-2 py-2 whitespace-nowrap">{o.name}</td>
                <td className="px-2 py-2 whitespace-nowrap">{o.category}</td>
                <td className="px-2 py-2 whitespace-nowrap">{o.map_locate.slice(0, 20)}</td>
                <td className="px-2 py-2 whitespace-nowrap">$ {Number(o.price).toLocaleString()}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.unit}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.num_reviews}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.rating ? o.rating : "Sin comentarios"}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatearFecha(o.created)}</td>
                <td className="px-2 py-1 text-center align-center">
                  <IconButton className="focus:outline-none" onClick={() => handleOpenModal(o.user)}>
                    <VisibilityIcon className="text-[#39A900]" />
                  </IconButton>
                  <IconButton className="focus:outline-none" onClick={() => handleOpenEditModal(o.id)}>
                    <EditIcon className="text-blue-600" />
                  </IconButton>
                  <IconButton className="focus:outline-none" onClick={() => handleOpen(o.id)}>
                    <DeleteIcon className="text-red-600" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={9} className="px-2 py-2 text-center">
                No se encontraron productos
              </td>
            </tr>
          </tbody>
        )}
      </table>
      {/* Modal para mostrar detalles del usuario */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 500,
            maxHeight: 700,
            padding: 2,
            backgroundColor: "background.paper",
            margin: "auto",
            marginTop: "10%",
          }}
        >
          {dataUser ? (
            <div className="text-center">
              <img src={"./../../public/avatar.png"} alt="avatar" className="w-24 h-24 rounded-full mx-auto" />
              <h2 className="text-xl font-bold mt-4">{dataUser.name}</h2>
              <p className="text-gray-600">{dataUser.email}</p>
              <p className="text-gray-600">{dataUser.phone}</p>
            </div>
          ) : (
            <p>No hay información disponible</p>
          )}
          <div className="w-full text-center">
            <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-[#39A900] text-white rounded w-6/12">
              Cerrar
            </button>
          </div>
        </Box>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ width: 400, padding: 2, backgroundColor: "background.paper", margin: "auto", marginTop: "20%" }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            ¿Realmente desea eliminar este producto?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={confirmarEliminar} // Lógica para confirmar
              sx={{ marginRight: 1 }}
            >
              Confirmar
            </Button>
            <Button
              variant="contained"
              onClick={handleClose} // Cerrar modal
              sx={{
                marginLeft: 1,
                backgroundColor: "#808080", // Color gris medio
                color: "white", // Color de texto blanco
                "&:hover": {
                  backgroundColor: "#454545", // Color gris oscuro en hover
                },
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de edición de producto */}
      <Modal open={editModalOpen} onClose={handleCloseEditModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Box
          sx={{
            width: { xs: "95%", sm: 650 },
            borderRadius: "8px",
            maxHeight: "85vh",
            padding: 0,
            backgroundColor: "background.paper",
            margin: "auto",
            marginTop: "5%",
            overflowY: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        >
          {editingProduct ? (
            <div className="flex flex-col" style={{ minHeight: "85vh", overflowY: "auto" }}>
              <div className="bg-[#39A900] p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-white text-center">Editar Producto</h2>
                <p className="text-green-100 text-center text-sm mt-1">{editingProduct.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-4">
                  <TextField
                    label="Nombre del producto"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
                  />

                  <TextField
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <FormControl fullWidth variant="outlined" sx={{ borderRadius: "8px" }}>
                    <InputLabel id="category-label">Categoría</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Categoría"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      sx={{ borderRadius: "8px" }}
                    >
                      <MenuItem value="FRUTAS">Frutas</MenuItem>
                      <MenuItem value="VERDURAS">Verduras</MenuItem>
                      <MenuItem value="GRANOS">Granos</MenuItem>
                      <MenuItem value="OTROS">Otros</MenuItem>
                    </Select>
                  </FormControl>

                    <TextField
                      label="Precio"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <span className="text-gray-500 mr-1">$</span>,
                        sx: { borderRadius: "8px" },
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <TextField
                      label="Stock disponible"
                      name="count_in_stock"
                      type="number"
                      value={formData.count_in_stock}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: "8px" },
                      }}
                    />

                    <TextField
                      label="Unidad de medida"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: "8px" },
                      }}
                    />
                  </div>

                  <TextField
                    label="Ubicación en mapa"
                    name="map_locate"
                    value={formData.map_locate}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "8px" },
                    }}
                  />

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Typography variant="subtitle1" className="font-medium mb-2">
                      Imagen del producto
                    </Typography>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col w-full h-24 border-2 border-dashed border-blue-300 rounded-lg hover:bg-gray-100 hover:border-blue-400 transition-all cursor-pointer">
                        {formData.image ? (
                          <div className="flex items-center justify-center h-full">
                            {typeof formData.image === 'string' ? (
                              <img 
                                src={formData.image} 
                                alt="Vista previa" 
                                className="h-full object-contain rounded"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                <img 
                                  src={URL.createObjectURL(formData.image)} 
                                  alt="Vista previa" 
                                  className="h-16 object-contain"
                                />
                                <p className="text-xs text-gray-500 mt-1 truncate w-40">
                                  {formData.image.name}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-4">
                            <svg
                              className="w-6 h-6 text-gray-400 group-hover:text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              ></path>
                            </svg>
                            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                              Seleccionar imagen
                            </p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="opacity-0 absolute" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones fijos en la parte inferior */}
              <div className="mt-auto p-4 bg-gray-50 border-t flex justify-end space-x-2 rounded-b-lg">
                <Button
                  variant="outlined"
                  onClick={handleCloseEditModal}
                  sx={{
                    borderRadius: "4px",
                    textTransform: "none",
                    padding: "6px 16px",
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEditSubmit}
                  sx={{
                    borderRadius: "4px",
                    backgroundColor: "#39A900",
                    "&:hover": {
                      backgroundColor: "#2d8500",
                    },
                    textTransform: "none",
                    padding: "6px 16px",
                  }}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando información del producto...</p>
            </div>
          )}
        </Box>
      </Modal>

      <div>
        <Pagination
          count={Math.ceil(dataLenght / 10)}
          page={page}
          onChange={(event, value) => setPage(value)}
          className="flex flex-row w-full justify-center my-6"
        />
      </div>
    </div>
  )
}

export default Products
