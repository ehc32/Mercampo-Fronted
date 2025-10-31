"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"
import Pagination from "@mui/material/Pagination"
import {
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Typography,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { get_solo_user } from "../api/users"
import { my_orders, my_pending_orders, seller_delivered_orders, edit_order, seller_orders_by_status, update_order_status } from "../api/orders"
import { useAuthStore } from "../hooks/auth"
import { get_all_products_by_user, get_products_in_sells_by_user } from "../api/products"
import ProfileTables from "../components/profile/profileTables"
import { CheckCircle, ThumbsUp, Package } from "lucide-react"
import { checkOrderConfirmation, confirmOrderReceived } from "../api/notifications"
import { edit_product } from "../api/products"

interface OrderInterface {
  id: number
  user: {
    id: number
    email: string
    name: string
  }
  shoppingaddress: {
    id: number
    address: string
    city: string
    postal_code: string
    country: string
  }
  orderitem_set: Array<{
    id: number
    product: {
      id: number
      name: string
    }
    quantity: number
    price: string
  }>
  total_price: string
  is_paid: boolean
  paid_at: string | null
  is_delivered: boolean
  delivered_at: string | null
  created_at: string
  payment_method: string | null
  status?: string  // Estado de la orden: pending, preparing, shipped, delivered, completed, cancelled
  orderconfirmation?: {
    confirmed_at: string
    confirmed_by_user: number
  }
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

interface MyOrder {
  id: number
  name: string
  price: number
  description: string
  created: string
  count_in_sells: number
  rating: number
  count_in_stock: number
  fecha_limite: string
  quantity: number
  unit: string
  category: string
  map_locate: string
  image: string
}

const UserProfile = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [tabValue, setTabValue] = useState(() => {
    // Recuperar la pestaña seleccionada del localStorage si existe
    const savedTab = localStorage.getItem("profileTab")
    return savedTab || "compras"
  })
  const [myProducts, setMyProducts] = useState([])
  const [dataLenght, setDataLenght] = useState(0)
  const [myProductsSells, setMyProductsSells] = useState([])
  const [dataLenght2, setDataLenght2] = useState(0)
  const [orders, setOrders] = useState<OrderInterface[]>([])
  const [pendingOrders, setPendingOrders] = useState<OrderInterface[]>([])
  const [deliveredOrders, setDeliveredOrders] = useState<OrderInterface[]>([])
  
  // Estados para subtabs de ventas
  const [salesSubTab, setSalesSubTab] = useState("pending") // pending, shipped, completed
  const [salesOrders, setSalesOrders] = useState<OrderInterface[]>([])
  const [isSalesLoading, setIsSalesLoading] = useState(false)
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPendingLoading, setIsPendingLoading] = useState(false)
  const [isDeliveredLoading, setIsDeliveredLoading] = useState(false)
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null)
  const [confirmedCount, setConfirmedCount] = useState(0)

  const [ordersPage, setOrdersPage] = useState(1)
  const [pendingOrdersPage, setPendingOrdersPage] = useState(1)
  const [deliveredOrdersPage, setDeliveredOrdersPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const { access: token } = useAuthStore()
  const id = token ? JSON.parse(atob(token.split(".")[1])).user_id : null

  const { data: user } = useQuery<User>(["users", id], () => get_solo_user(id), {
    enabled: !!id,
  })

  // Guardar la pestaña seleccionada en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("profileTab", tabValue)
  }, [tabValue])

  function formatearFecha(fechaISO: any) {
    if (!fechaISO) return "N/A"
    const fecha = new Date(fechaISO)
    const dia = fecha.getDate().toString().padStart(2, "0")
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0")
    const year = fecha.getFullYear()
    return `${dia}-${mes}-${year}`
  }

  const get_my_products = async (id: number) => {
    const response = await get_all_products_by_user(id)
    setMyProducts(response.data)
    setDataLenght(response.meta.count)
  }

  const get_sells_by_user2 = async (id: number) => {
    const response = await get_products_in_sells_by_user(id)
    setMyProductsSells(response.data)
    setDataLenght2(response.meta.count)
  }

  // Modificar la función fetchMyOrders para incluir la verificación de confirmaciones
  const fetchMyOrders = async () => {
    try {
      setIsLoading(true)
      const response = await my_orders()
      console.log("Orders response:", response)

      // Asegurarse de que todas las órdenes tengan la propiedad orderconfirmation
      const ordersWithConfirmation = response.map((order) => {
        // Si ya tiene orderconfirmation, mantenerlo
        if (order.orderconfirmation) {
          return order
        }
        // Si no tiene orderconfirmation pero está marcado como entregado,
        // verificar si ya ha sido confirmado en el backend
        if (order.is_delivered && !order.orderconfirmation) {
          return {
            ...order,
            // Inicialmente sin confirmación, se actualizará si es necesario
            orderconfirmation: null,
          }
        }
        return order
      })

      setOrders(ordersWithConfirmation)
      setIsLoading(false)

      // Verificar el estado de confirmación de cada orden entregada
      for (const order of ordersWithConfirmation) {
        if (order.is_delivered && !order.orderconfirmation) {
          try {
            const confirmationStatus = await checkOrderConfirmation(order.id)
            if (confirmationStatus.confirmed) {
              // Actualizar el estado local si la orden ya fue confirmada
              setOrders((prevOrders) =>
                prevOrders.map((o) =>
                  o.id === order.id
                    ? {
                        ...o,
                        orderconfirmation: {
                          confirmed_at: confirmationStatus.confirmed_at,
                          confirmed_by_user: confirmationStatus.confirmed_by_user,
                        },
                      }
                    : o,
                ),
              )
            }
          } catch (error) {
            console.error(`Error checking confirmation for order ${order.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error al cargar tus órdenes")
      setIsLoading(false)
    }
  }

  // Modificar la función fetchDeliveredOrders para verificar confirmaciones
  const fetchDeliveredOrders = async () => {
    try {
      setIsDeliveredLoading(true)
      const response = await seller_delivered_orders()
      console.log("Delivered orders response:", response)

      // Verificar cada orden para ver si tiene confirmación
      let confirmedOrdersCount = 0

      // Primero establecer las órdenes en el estado
      setDeliveredOrders(response)

      // Luego verificar cada orden para actualizar el contador de confirmaciones
      for (const order of response) {
        try {
          // Si ya tiene confirmación en la respuesta, contarla
          if (order.orderconfirmation) {
            confirmedOrdersCount++
            continue
          }

          // Si no tiene confirmación, verificar con el backend
          const confirmationStatus = await checkOrderConfirmation(order.id)
          if (confirmationStatus.confirmed) {
            confirmedOrdersCount++

            // Actualizar la orden en el estado
            setDeliveredOrders((prevOrders) =>
              prevOrders.map((o) =>
                o.id === order.id
                  ? {
                      ...o,
                      orderconfirmation: {
                        confirmed_at: confirmationStatus.confirmed_at,
                        confirmed_by_user: confirmationStatus.confirmed_by_user,
                      },
                    }
                  : o,
              ),
            )
          }
        } catch (error) {
          console.error(`Error checking confirmation for order ${order.id}:`, error)
        }
      }

      // Actualizar el contador de confirmaciones
      setConfirmedCount(confirmedOrdersCount)
      setIsDeliveredLoading(false)
    } catch (error) {
      console.error("Error fetching delivered orders:", error)
      toast.error("Error al cargar órdenes entregadas")
      setIsDeliveredLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      setIsPendingLoading(true)
      const response = await my_pending_orders()
      console.log("Pending orders response:", response)
      setPendingOrders(response)
      setIsPendingLoading(false)
    } catch (error) {
      console.error("Error fetching pending orders:", error)
      toast.error("Error al cargar órdenes pendientes")
      setIsPendingLoading(false)
    }
  }

  // Nueva función para cargar órdenes de ventas por estado
  const fetchSalesOrders = async (statusType: string) => {
    try {
      setIsSalesLoading(true)
      const response = await seller_orders_by_status(statusType)
      console.log(`Sales orders (${statusType}) response:`, response)
      setSalesOrders(response || [])
      setIsSalesLoading(false)
    } catch (error) {
      console.error(`Error fetching sales orders (${statusType}):`, error)
      toast.error(`Error al cargar órdenes de ventas (${statusType})`)
      setIsSalesOrders([])
      setIsSalesLoading(false)
    }
  }

  // Modificar la función handleConfirmReceived para manejar mejor los errores y evitar confirmaciones duplicadas
  const handleConfirmReceived = async (orderId: number) => {
    try {
      // Verificar primero si la orden ya ha sido confirmada
      const confirmationStatus = await checkOrderConfirmation(orderId)
      if (confirmationStatus.confirmed) {
        // Si ya está confirmada, actualizar el estado local y mostrar un mensaje
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderconfirmation: {
                    confirmed_at: confirmationStatus.confirmed_at,
                    confirmed_by_user: confirmationStatus.confirmed_by_user,
                  },
                }
              : order,
          ),
        )
        toast.info("Este pedido ya ha sido confirmado anteriormente")
        return
      }

      // Si no está confirmada, proceder con la confirmación
      setConfirmingOrderId(orderId)
      const response = await confirmOrderReceived(orderId)

      // Actualizar la lista de órdenes con la confirmación y el nuevo estado
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'completed',  // Actualizar el estado a completado
                is_delivered: true,
                orderconfirmation: {
                  confirmed_at: response.confirmed_at || new Date().toISOString(),
                  confirmed_by_user: id as number,
                },
              }
            : order,
        ),
      )
      
      // Refrescar las órdenes para obtener los datos actualizados
      await fetchMyOrders()

      toast.success("¡Gracias por confirmar la recepción de tu pedido! El vendedor ha sido notificado.")
      setConfirmingOrderId(null)
    } catch (error) {
      console.error("Error al confirmar la recepción:", error)

      // Verificar si el error es porque ya está confirmada
      if (error.response && error.response.status === 400 && error.response.data.detail === "Order already confirmed") {
        toast.info("Este pedido ya ha sido confirmado anteriormente")

        // Actualizar el estado local para reflejar que ya está confirmado
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderconfirmation: {
                    confirmed_at: new Date().toISOString(),
                    confirmed_by_user: id as number,
                  },
                }
              : order,
          ),
        )
      } else {
        toast.error("Error al confirmar la recepción del pedido")
      }

      setConfirmingOrderId(null)
    }
  }

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId)
      await edit_order(orderId)

      // Actualizar la lista de órdenes pendientes
      setPendingOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))

      // Actualizar la lista de órdenes entregadas si estamos en esa pestaña
      if (tabValue === "ventas") {
        fetchDeliveredOrders()
        // Recargar las órdenes del subtab actual
        fetchSalesOrders(salesSubTab)
      }

      toast.success("Orden marcada como entregada exitosamente")
      setProcessingOrderId(null)
    } catch (error) {
      console.error("Error al marcar la orden como entregada:", error)
      toast.error("Error al marcar la orden como entregada")
      setProcessingOrderId(null)
    }
  }

  // Función para actualizar el estado de una orden desde la sección de ventas
  const handleUpdateSalesOrderStatus = async (orderId: number, currentStatus: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'shipped', // Comenzar entrega
    }

    const nextStatus = statusMap[currentStatus]
    if (!nextStatus) {
      toast.error("No se puede actualizar este estado")
      return
    }

    setProcessingOrderId(orderId)
    try {
      await update_order_status(orderId, nextStatus)
      toast.success('Orden actualizada a: En entrega')
      // Recargar las órdenes del subtab actual
      await fetchSalesOrders(salesSubTab)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al actualizar el estado de la orden")
    } finally {
      setProcessingOrderId(null)
    }
  }

  // Función para obtener el texto del botón según el estado
  const getStatusButtonText = (status: string): string | null => {
    switch (status) {
      case 'pending':
        return 'Comenzar entrega'
      default:
        return null
    }
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeStyle = (status: string) => {
    const styles: { [key: string]: { bg: string; color: string; text: string } } = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Pendiente' },
      shipped: { bg: '#d1ecf1', color: '#055160', text: 'En entrega' },
      delivered: { bg: '#d4edda', color: '#155724', text: 'Entregado' }, // compatibilidad
      completed: { bg: '#d1e7dd', color: '#0f5132', text: 'Completado' },
    }
    return styles[status] || styles.pending
  }

  const handleOpenOrderModal = async (orderId: number, ordersList: OrderInterface[]) => {
    try {
      // Encontrar la orden por ID
      const order = ordersList.find((o) => o.id === orderId)
      if (order) {
        // Transformar orderitem_set al formato esperado por el modal
        const items = order.orderitem_set.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        }))
        setSelectedOrderProducts(items)
        setIsOrderModalOpen(true)
      }
    } catch (error) {
      toast.error("Error al cargar los productos de la orden")
    }
  }

  useEffect(() => {
    if (id) {
      get_my_products(id)
    }
  }, [id])

  useEffect(() => {
    if (user && (user.role === "seller" || user.role === "admin")) {
      get_sells_by_user2(id)
    }
  }, [user, id])

  // Fetch orders when component loads or tab changes
  useEffect(() => {
    if (tabValue === "compras") {
      fetchMyOrders()
    } else if (tabValue === "pendientes" && (user?.role === "seller" || user?.role === "admin")) {
      fetchPendingOrders()
    } else if (tabValue === "ventas" && (user?.role === "seller" || user?.role === "admin")) {
      // Cargar órdenes pendientes por defecto
      fetchSalesOrders("pending")
    }
  }, [tabValue, user?.role])

  // Cargar órdenes cuando cambia el subtab de ventas
  useEffect(() => {
    if (tabValue === "ventas" && (user?.role === "seller" || user?.role === "admin") && salesSubTab) {
      fetchSalesOrders(salesSubTab)
    }
  }, [salesSubTab, tabValue, user?.role])

  // Verificar si hay un ID de orden para resaltar (desde notificaciones)
  useEffect(() => {
    const highlightedOrderId = localStorage.getItem("highlightedOrderId")
    if (highlightedOrderId && tabValue === "ventas" && deliveredOrders.length > 0) {
      // Resaltar la orden específica (puedes implementar un efecto visual aquí)
      const orderId = Number.parseInt(highlightedOrderId)
      const orderElement = document.getElementById(`order-row-${orderId}`)
      if (orderElement) {
        orderElement.scrollIntoView({ behavior: "smooth", block: "center" })
        orderElement.classList.add("bg-green-100")
        setTimeout(() => {
          orderElement.classList.remove("bg-green-100")
        }, 3000)
      }

      // Limpiar el ID después de usarlo
      localStorage.removeItem("highlightedOrderId")
    }
  }, [tabValue, deliveredOrders])

  const isWideScreen = window.innerWidth > 900

  // Calcular el total de ventas
  const calculateTotalSales = () => {
    if (!deliveredOrders || deliveredOrders.length === 0) return 0
    return deliveredOrders.reduce((total, order) => total + Number(order.total_price), 0)
  }

  // Calcular el total de ventas confirmadas
  const calculateConfirmedSales = () => {
    // Usar el contador actualizado en lugar de calcular en el momento
    return confirmedCount
  }

  // Pagination helpers
  const paginateData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data?.slice(startIndex, endIndex) || []
  }

  // Get paginated data for each tab
  const paginatedOrders = paginateData(orders, ordersPage, itemsPerPage)
  const paginatedPendingOrders = paginateData(pendingOrders, pendingOrdersPage, itemsPerPage)
  const paginatedDeliveredOrders = paginateData(deliveredOrders, deliveredOrdersPage, itemsPerPage)
  const paginatedMyProducts = paginateData(myProducts, page, itemsPerPage)
  const paginatedMyProductsSells = paginateData(myProductsSells, page, itemsPerPage)

  // Estados y funciones para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MyOrder | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    count_in_stock: 0,
    unit: "",
    map_locate: "",
    image: null,
  })

  const handleOpenEditModal = (product: MyOrder) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: (product as any).category_name || product.category || "",
      price: product.price,
      count_in_stock: product.count_in_stock,
      unit: (product as any).unit_name || product.unit || "",
      map_locate: product.map_locate,
      image: product.image,
    })
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingProduct(null)
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e: any) => {
    const imageFile = e.target.files[0]
    setFormData({
      ...formData,
      image: imageFile,
    })
  }

  // Reemplazar la función handleEditSubmit actual con esta implementación completa:

  const handleEditSubmit = async () => {
    if (!editingProduct) return

    try {
      let imageBase64: string | null = null

      // Convertir la imagen a base64 si existe y es un archivo (no una URL)
      if (formData.image && !(typeof formData.image === "string")) {
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
        image: imageBase64 || formData.image, // Se envía en base64 si es nuevo archivo, o la URL si no cambió
      }

      await edit_product(productToUpdate)
      toast.success("Producto actualizado con éxito")

      // Actualizar la lista de productos
      if (id) {
        get_my_products(id)
      }

      handleCloseEditModal()
    } catch (error) {
      console.error("Error al actualizar el producto:", error)
      toast.error("Error al actualizar el producto")
    }
  }

  return (
    <Box sx={{ maxWidth: "lg", mx: "auto", p: isWideScreen ? 6 : 1, mt: ".1em" }}>
      <Card className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent>
          <Typography variant="h4" className="titulo-sala-compra-light text-2xl font-semibold text-gray-800 mb-6">
            Perfil del usuario
          </Typography>
          <ProfileTables user={user} id={id} />
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-lg">
        <CardContent>
          <Typography variant="h4" className="titulo-sala-compra-light text-2xl font-semibold text-gray-800 mb-2">
            Registro de compraventa
          </Typography>
          <Typography variant="subtitle1" className="sub-titulo-sala-compra-light text-gray-600 mb-6">
            Visualiza tus órdenes de productos
            {user?.role === "seller" && <span className="text-[#39A900]"> o ventas que has realizado</span>}
            {user?.role === "admin" && <span className="text-[#39A900]"> o ventas que has realizado</span>}
          </Typography>

          <div className="flex justify-between items-center py-4">
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => {
                setTabValue(newValue)
                setOrdersPage(1)
                setPendingOrdersPage(1)
                setDeliveredOrdersPage(1)
                setPage(1)
              }}
              textColor="primary"
              indicatorColor="primary"
              sx={{ ".MuiTabs-indicator": { backgroundColor: "#39A900" } }}
            >
              <Tab
                label="Compras"
                value="compras"
                sx={{ "&.Mui-selected": { color: "#39A900" } }}
                className="focus:outline-none"
              />
              {user?.role === "seller" && (
                <Tab
                  label="Órdenes Pendientes"
                  value="pendientes"
                  sx={{ "&.Mui-selected": { color: "#39A900" } }}
                  className="focus:outline-none"
                />
              )}
              {user?.role !== "client" && (
                <Tab
                  label="Ventas"
                  value="ventas"
                  sx={{ "&.Mui-selected": { color: "#39A900" } }}
                  className="focus:outline-none"
                />
              )}
              {user?.role !== "client" && (
                <Tab
                  label="Mis productos"
                  value="productos"
                  sx={{ "&.Mui-selected": { color: "#39A900" } }}
                  className="focus:outline-none"
                />
              )}
            </Tabs>
          </div>

          <Box>
            {tabValue === "compras" && (
              <>
                {isLoading ? (
                  <Typography align="center" py={3}>
                    Cargando órdenes...
                  </Typography>
                ) : orders && orders.length > 0 ? (
                  <>
                    <Alert severity="info" className="mb-4">
                      Cuando recibas tu pedido, por favor confirma la recepción para notificar al vendedor.
                    </Alert>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Precio total</TableCell>
                          <TableCell>Dirección de compra</TableCell>
                          <TableCell>Fecha de pedido</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Productos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>${Number(order.total_price).toLocaleString()}</TableCell>
                            <TableCell>
                              {order.shoppingaddress
                                ? `${order.shoppingaddress.address}, ${order.shoppingaddress.city}`
                                : "No disponible"}
                            </TableCell>
                          <TableCell>{formatearFecha(order.created_at)}</TableCell>
                          <TableCell>
                            {order.status === 'shipped' ? (
                              <span className="text-cyan-700">Entregando pedido</span>
                            ) : order.is_delivered || order.status === 'completed' ? (
                              <span className="text-green-600">
                                Entregado {order.delivered_at && `(${formatearFecha(order.delivered_at)})`}
                                {order.orderconfirmation && (
                                  <Tooltip title={`Confirmado el ${formatearFecha(order.orderconfirmation.confirmed_at)}`}>
                                    <Badge color="success" variant="dot" sx={{ ml: 1 }}>
                                      <ThumbsUp size={16} className="text-green-600" />
                                    </Badge>
                                  </Tooltip>
                                )}
                              </span>
                            ) : (
                              <span className="text-yellow-600">Pendiente</span>
                            )}
                          </TableCell>
                            <TableCell>
                              <Button onClick={() => handleOpenOrderModal(order.id, orders)}>
                                Ver Productos ({order.orderitem_set.length})
                              </Button>
                            </TableCell>
                            <TableCell>
                              {(order.status === 'shipped' || order.status === 'delivered' || (order.is_delivered && order.status !== 'completed')) && !order.orderconfirmation ? (
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={
                                    confirmingOrderId === order.id ? (
                                      <CircularProgress size={20} color="inherit" />
                                    ) : (
                                      <Package size={20} />
                                    )
                                  }
                                  onClick={() => handleConfirmReceived(order.id)}
                                  disabled={confirmingOrderId === order.id}
                                  sx={{
                                    backgroundColor: "#39A900",
                                    "&:hover": { backgroundColor: "#2c7d00" },
                                  }}
                                >
                                  {confirmingOrderId === order.id ? "Procesando..." : "Confirmar recepción"}
                                </Button>
                              ) : (order.orderconfirmation || order.status === 'completed') ? (
                                <Typography variant="body2" className="text-green-600 font-medium">
                                  Recepción confirmada
                                </Typography>
                              ) : (
                                <Typography variant="body2" className="text-gray-500">
                                  Pendiente de entrega
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div>
                      <Pagination
                        count={Math.ceil((orders?.length || 0) / itemsPerPage)}
                        page={ordersPage}
                        onChange={(event, value) => setOrdersPage(value)}
                        className="flex flex-row w-full justify-center my-6"
                      />
                    </div>
                  </>
                ) : (
                  <Typography align="center" py={3}>
                    No tienes órdenes de compra
                  </Typography>
                )}
              </>
            )}

            {tabValue === "pendientes" && (user?.role === "seller" || user?.role === "admin") && (
              <>
                {isPendingLoading ? (
                  <Typography align="center" py={3}>
                    Cargando órdenes pendientes...
                  </Typography>
                ) : pendingOrders && pendingOrders.length > 0 ? (
                  <>
                    <Alert severity="info" className="mb-4">
                      Tienes {pendingOrders.length} órdenes pendientes por entregar. Marca como entregadas las órdenes
                      que ya hayas procesado.
                    </Alert>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Precio total</TableCell>
                          <TableCell>Dirección de entrega</TableCell>
                          <TableCell>Fecha de pedido</TableCell>
                          <TableCell>Estado de pago</TableCell>
                          <TableCell>Productos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedPendingOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>${Number(order.total_price).toLocaleString()}</TableCell>
                            <TableCell>
                              {order.shoppingaddress
                                ? `${order.shoppingaddress.address}, ${order.shoppingaddress.city}`
                                : "No disponible"}
                            </TableCell>
                            <TableCell>{formatearFecha(order.created_at)}</TableCell>
                            <TableCell>
                              {order.is_paid ? (
                                <span className="text-green-600">
                                  Pagado {order.paid_at && `(${formatearFecha(order.paid_at)})`}
                                </span>
                              ) : (
                                <span className="text-red-600">No pagado</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button onClick={() => handleOpenOrderModal(order.id, pendingOrders)}>
                                Ver Productos ({order.orderitem_set.length})
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                  processingOrderId === order.id ? (
                                    <CircularProgress size={20} color="inherit" />
                                  ) : (
                                    <CheckCircle size={20} />
                                  )
                                }
                                onClick={() => handleMarkAsDelivered(order.id)}
                                disabled={processingOrderId === order.id || !order.is_paid}
                                sx={{
                                  backgroundColor: "#39A900",
                                  "&:hover": { backgroundColor: "#2c7d00" },
                                  "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#a0a0a0" },
                                }}
                              >
                                {processingOrderId === order.id ? "Procesando..." : "Marcar entregado"}
                              </Button>
                              {!order.is_paid && (
                                <Typography variant="caption" className="block text-red-500 mt-1">
                                  Debe estar pagada para entregar
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div>
                      <Pagination
                        count={Math.ceil((pendingOrders?.length || 0) / itemsPerPage)}
                        page={pendingOrdersPage}
                        onChange={(event, value) => setPendingOrdersPage(value)}
                        className="flex flex-row w-full justify-center my-6"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-8 px-4">
                    <Alert severity="success" className="mb-4">
                      ¡No tienes órdenes pendientes por entregar!
                    </Alert>
                    <div className="text-center mt-4">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setTabValue("ventas")}
                        sx={{ backgroundColor: "#39A900", "&:hover": { backgroundColor: "#2c7d00" } }}
                      >
                        Ver mis ventas completadas
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {tabValue === "ventas" && (user?.role === "seller" || user?.role === "admin") && (
              <>
                {/* Subtabs para organizar ventas por estado */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs
                    value={salesSubTab}
                    onChange={(e, newValue) => setSalesSubTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Pendientes" value="pending" />
                    <Tab label="En entrega" value="shipped" />
                    <Tab label="Completadas" value="completed" />
                  </Tabs>
                </Box>

                {/* Contenido según el subtab seleccionado */}
                {isSalesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', py: 8 }}>
                    <CircularProgress sx={{ color: '#39A900' }} />
                  </Box>
                ) : salesOrders && salesOrders.length > 0 ? (
                  <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Precio total</TableCell>
                          <TableCell>Dirección de entrega</TableCell>
                          <TableCell>Fecha de pedido</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Productos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesOrders.map((order) => {
                          const statusStyle = getStatusBadgeStyle(order.status || 'pending')
                          const buttonText = getStatusButtonText(order.status || 'pending')
                          const isProcessing = processingOrderId === order.id
                          
                          return (
                            <TableRow key={order.id}>
                              <TableCell>{order.user?.email || order.user?.name || "Sin usuario"}</TableCell>
                              <TableCell>${parseFloat(order.total_price || 0).toLocaleString('es-CO')}</TableCell>
                              <TableCell>
                                {order.shoppingaddress?.address 
                                  ? `${order.shoppingaddress.address}, ${order.shoppingaddress.city || ''}` 
                                  : "Sin registrar"}
                              </TableCell>
                              <TableCell>
                                {order.created_at ? formatearFecha(order.created_at) : "N/A"}
                              </TableCell>
                              <TableCell>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {statusStyle.text}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button onClick={() => handleOpenOrderModal(order.id, salesOrders)}>
                                  Ver Productos ({order.orderitem_set?.length || 0})
                                </Button>
                              </TableCell>
                              <TableCell>
                                {buttonText && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isProcessing || !order.is_paid}
                                    onClick={() => handleUpdateSalesOrderStatus(order.id, order.status || 'pending')}
                                    sx={{
                                      bgcolor: '#39A900',
                                      '&:hover': { bgcolor: '#2f6d30' },
                                      fontSize: '11px',
                                      padding: '4px 8px',
                                      '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#a0a0a0' },
                                    }}
                                    startIcon={isProcessing ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CheckCircle size={14} />}
                                  >
                                    {isProcessing ? 'Procesando...' : buttonText}
                                  </Button>
                                )}
                                {!order.is_paid && (
                                  <Typography variant="caption" className="block text-red-500 mt-1" style={{ fontSize: '10px' }}>
                                    Debe estar pagada
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="py-8 px-4">
                    <Alert severity="info" className="mb-4">
                      No tienes órdenes en este estado actualmente
                    </Alert>
                  </div>
                )}
              </>
            )}

            {/* Sección antigua de ventas completadas - mantener temporalmente para compatibilidad */}
            {tabValue === "ventas_old" && (user?.role === "seller" || user?.role === "admin") && (
              <>
                {isDeliveredLoading ? (
                  <Typography align="center" py={3}>
                    Cargando ventas completadas...
                  </Typography>
                ) : deliveredOrders && deliveredOrders.length > 0 ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                      <Typography variant="h6" className="text-green-800 font-semibold">
                        Resumen de Ventas
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <Typography variant="body2" className="text-gray-600">
                            Total de ventas completadas
                          </Typography>
                          <Typography variant="h6" className="text-green-700 font-bold">
                            {deliveredOrders.length}
                          </Typography>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <Typography variant="body2" className="text-gray-600">
                            Ventas confirmadas por clientes
                          </Typography>
                          <Typography variant="h6" className="text-green-700 font-bold">
                            {calculateConfirmedSales()} de {deliveredOrders.length}
                          </Typography>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <Typography variant="body2" className="text-gray-600">
                            Monto total
                          </Typography>
                          <Typography variant="h6" className="text-green-700 font-bold">
                            ${calculateTotalSales().toLocaleString()}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Precio total</TableCell>
                          <TableCell>Dirección de entrega</TableCell>
                          <TableCell>Fecha de pedido</TableCell>
                          <TableCell>Fecha de entrega</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Productos</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDeliveredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            id={`order-row-${order.id}`}
                            className="transition-colors duration-300"
                          >
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>${Number(order.total_price).toLocaleString()}</TableCell>
                            <TableCell>
                              {order.shoppingaddress
                                ? `${order.shoppingaddress.address}, ${order.shoppingaddress.city}`
                                : "No disponible"}
                            </TableCell>
                            <TableCell>{formatearFecha(order.created_at)}</TableCell>
                            <TableCell>{formatearFecha(order.delivered_at)}</TableCell>
                            <TableCell>
                              {order.orderconfirmation ? (
                                <Tooltip
                                  title={`Confirmado el ${formatearFecha(order.orderconfirmation.confirmed_at)}`}
                                >
                                  <span className="flex items-center text-green-600">
                                    <ThumbsUp size={16} className="mr-1" />
                                    Recibido por cliente
                                  </span>
                                </Tooltip>
                              ) : (
                                <span className="text-yellow-600">Pendiente de confirmación</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button onClick={() => handleOpenOrderModal(order.id, deliveredOrders)}>
                                Ver Productos ({order.orderitem_set.length})
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div>
                      <Pagination
                        count={Math.ceil((deliveredOrders?.length || 0) / itemsPerPage)}
                        page={deliveredOrdersPage}
                        onChange={(event, value) => setDeliveredOrdersPage(value)}
                        className="flex flex-row w-full justify-center my-6"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-8 px-4">
                    <Alert severity="info" className="mb-4">
                      No tienes ventas completadas todavía
                    </Alert>
                    <div className="text-center mt-4">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setTabValue("pendientes")}
                        sx={{ backgroundColor: "#39A900", "&:hover": { backgroundColor: "#2c7d00" } }}
                      >
                        Ver órdenes pendientes
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {tabValue === "ventas" && user?.role !== "seller" && user?.role !== "admin" && (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Precio total</TableCell>
                      <TableCell>Dirección de venta</TableCell>
                      <TableCell>Fecha de venta</TableCell>
                      <TableCell>Productos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataLenght2 > 0 ? (
                      paginatedMyProductsSells.map((product: MyOrder) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name.slice(0, 10)}</TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell>{product.description.slice(0, 20)}...</TableCell>
                          <TableCell>{formatearFecha(product.created)}</TableCell>
                          <TableCell>{product.count_in_sells}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No hay información disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div>
                  <Pagination
                    count={Math.ceil(dataLenght2 / 10)}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    className="flex flex-row w-full justify-center my-6"
                  />
                </div>
              </>
            )}

            {tabValue === "productos" && (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-bold ">Nombre</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Calificación</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Cantidad restante</TableCell>
                      <TableCell>Vendidos</TableCell>
                      <TableCell>F. Creación</TableCell>
                      <TableCell>F. Vencimiento</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMyProducts.map((product: MyOrder) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name.slice(0, 12)}...</TableCell>
                        <TableCell>{product.description.slice(0, 20)}...</TableCell>
                        <TableCell>{product.rating}</TableCell>
                        <TableCell>${Number(product.price).toLocaleString()}</TableCell>
                        <TableCell>{product.count_in_stock}</TableCell>
                        <TableCell>{product.count_in_sells}</TableCell>
                        <TableCell className="w-32">{formatearFecha(product.created)}</TableCell>
                        <TableCell className="w-32">{formatearFecha(product.fecha_limite)}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenEditModal(product)}
                            sx={{
                              backgroundColor: "#39A900",
                              "&:hover": { backgroundColor: "#2c7d00" },
                              textTransform: "none",
                            }}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div>
                  <Pagination
                    count={Math.ceil(dataLenght / 10)}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    className="flex flex-row w-full justify-center my-6"
                  />
                </div>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Modal open={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" id="modal-title" className="text-xl font-bold mb-4">
            Detalles de la Orden
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold ">ID</TableCell>
                <TableCell className="font-bold ">Nombre</TableCell>
                <TableCell className="font-bold ">Cantidad</TableCell>
                <TableCell className="font-bold ">Precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedOrderProducts.map((product: MyOrder) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>$ {product.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-right">
            <Button
              onClick={() => setIsOrderModalOpen(false)}
              variant="contained"
              sx={{ backgroundColor: "#39A900", "&:hover": { backgroundColor: "#2c7d00" } }}
            >
              Cerrar
            </Button>
          </div>
        </Box>
      </Modal>
      {/* Modal de edición de producto */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
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
                            {typeof formData.image === "string" ? (
                              <img
                                src={formData.image || "/placeholder.svg"}
                                alt="Vista previa"
                                className="h-full object-contain rounded"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full">
                                <img
                                  src={URL.createObjectURL(formData.image) || "/placeholder.svg"}
                                  alt="Vista previa"
                                  className="h-16 object-contain"
                                />
                                <p className="text-xs text-gray-500 mt-1 truncate w-40">{formData.image.name}</p>
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
    </Box>
  )
}

export default UserProfile
