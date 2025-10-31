"use client"

import SearchIcon from "@mui/icons-material/Search"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { get_order_items, get_orders, update_order_status } from "../../api/orders"
import CircularProgress from "@mui/material/CircularProgress"

interface Props {
  results?: any
}

const Orders = ({ results }: Props) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrderProducts, setSelectedOrderProducts] = useState<any[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)

  // Función para obtener el siguiente estado según el estado actual
  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing'
      case 'preparing':
        return 'shipped'
      case 'shipped':
        return 'delivered'
      default:
        return null
    }
  }

  // Función para obtener el texto del botón según el estado
  const getButtonText = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'pending':
        return 'Marcar en Preparación'
      case 'preparing':
        return 'Marcar como Enviado'
      case 'shipped':
        return 'Marcar como Entregado'
      default:
        return null
    }
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeStyle = (status: string) => {
    const styles: { [key: string]: { bg: string; color: string; text: string } } = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Pendiente' },
      preparing: { bg: '#cfe2ff', color: '#084298', text: 'En Preparación' },
      shipped: { bg: '#d1ecf1', color: '#055160', text: 'Enviado' },
      delivered: { bg: '#d4edda', color: '#155724', text: 'Entregado' },
      completed: { bg: '#d1e7dd', color: '#0f5132', text: 'Completado' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelado' },
    }
    return styles[status] || styles.pending
  }

  const bring_orders = async () => {
    setLoading(true)
    try {
      const response = await get_orders()
      setData(response)
    } catch (e) {
      toast.error("Error al cargar las órdenes registradas")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: number, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus)
    if (!nextStatus) {
      toast.error("No se puede actualizar este estado")
      return
    }

    setProcessingOrderId(orderId)
    try {
      await update_order_status(orderId, nextStatus)
      toast.success(`Orden actualizada a: ${getStatusBadgeStyle(nextStatus).text}`)
      // Refrescar las órdenes
      await bring_orders()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al actualizar el estado de la orden")
    } finally {
      setProcessingOrderId(null)
    }
  }

  const fetchOrderProducts = async (orderId: number) => {
    try {
      const response = await get_order_items(orderId)
      setSelectedOrderProducts(response)
    } catch (e) {
      toast.error("Error al cargar los productos de la orden")
    }
  }

  useEffect(() => {
    bring_orders()
  }, [])

  const handleOpenModal = (orderId: number) => {
    setSelectedOrderId(orderId)
    fetchOrderProducts(orderId)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedOrderProducts([])
    setSelectedOrderId(null)
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <h2 className="text-xl font-semibold my-3 text-center text-black">Lista de órdenes pendientes</h2>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', py: 8 }}>
          <CircularProgress sx={{ color: '#39A900' }} />
        </Box>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-2 py-1 text-center">
                Cliente
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Precio total
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Dirección de entrega
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Fecha de pedido
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Estado de pago
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Estado
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Productos
              </th>
              <th scope="col" className="px-2 py-1 text-center">
                Acciones
              </th>
            </tr>
          </thead>
          {data && data.length > 0 ? (
            <tbody>
              {data.map((o: any) => {
                const statusStyle = getStatusBadgeStyle(o.status || 'pending')
                const buttonText = getButtonText(o.status || 'pending')
                const isProcessing = processingOrderId === o.id
                
                return (
                  <tr
                    key={o.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600"
                  >
                    <td className="px-2 py-1 text-center">{o.user?.email || o.user?.name || "Sin usuario"}</td>
                    <td className="px-2 py-1 text-center">$ {parseFloat(o.total_price || 0).toLocaleString('es-CO')}</td>
                    <td className="px-2 py-1 text-center">
                      {o.shoppingaddress?.address ? `${o.shoppingaddress.address}, ${o.shoppingaddress.city || ''}` : "Sin registrar"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('es-ES') : "N/A"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {o.is_paid ? (
                        <span style={{ color: '#155724' }}>
                          Pagado {o.paid_at ? `(${new Date(o.paid_at).toLocaleDateString('es-ES')})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#856404' }}>Pendiente</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center">
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
                    </td>
                    <td className="px-2 py-1 text-center">
                      <IconButton onClick={() => handleOpenModal(o.id)} size="small">
                        <SearchIcon />
                      </IconButton>
                      <span style={{ marginLeft: '4px', fontSize: '11px', color: '#666' }}>
                        VER PRODUCTOS ({o.orderitem_set?.length || 0})
                      </span>
                    </td>
                    <td className="px-2 py-1 text-center">
                      {buttonText && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={isProcessing}
                          onClick={() => handleStatusUpdate(o.id, o.status || 'pending')}
                          sx={{
                            bgcolor: '#39A900',
                            '&:hover': { bgcolor: '#2f6d30' },
                            fontSize: '11px',
                            padding: '4px 8px',
                          }}
                          startIcon={isProcessing ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
                        >
                          {isProcessing ? 'Procesando...' : buttonText}
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  No se encontraron órdenes pendientes
                </td>
              </tr>
            </tbody>
          )}
        </table>
      )}

      {/* Modal */}
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
          <h2 className="text-xl font-semibold my-3 text-center text-black">Lista de productos</h2>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderProducts.length > 0 ? (
                selectedOrderProducts.map((product: any) => (
                  <tr
                    key={product.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-1 text-center">{product.product?.name || product.product}</td>
                    <td className="px-6 py-1 text-center">$ {product.price}</td>
                    <td className="px-6 py-1 text-center">{product.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-1 text-center">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="w-full text-center">
            <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-[#39A900] text-white rounded w-6/12">
              Cerrar
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default Orders

