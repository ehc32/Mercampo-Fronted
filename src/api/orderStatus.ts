import { authAxios } from "./useAxios"

/**
 * Actualiza el estado de una orden
 * @param orderId - ID de la orden
 * @param status - Nuevo estado: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
 */
export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await authAxios.patch(`/orders/${orderId}/status/`, { status })
  return response.data
}

/**
 * Estados disponibles y sus descripciones
 */
export const ORDER_STATUSES = {
  pending: 'Pendiente',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  completed: 'Completado',
  cancelled: 'Cancelado',
} as const

/**
 * Obtiene el siguiente estado posible según el estado actual
 */
export const getNextStatus = (currentStatus: string, userRole: 'seller' | 'client') => {
  if (userRole === 'seller') {
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
  } else if (userRole === 'client') {
    if (currentStatus === 'delivered') {
      return 'completed'
    }
  }
  return null
}

/**
 * Obtiene el texto del botón según el estado actual
 */
export const getButtonText = (currentStatus: string, userRole: 'seller' | 'client') => {
  if (userRole === 'seller') {
    switch (currentStatus) {
      case 'pending':
        return 'Marcar en preparación'
      case 'preparing':
        return 'Marcar como enviado'
      case 'shipped':
        return 'Marcar como entregado'
      default:
        return null
    }
  } else if (userRole === 'client') {
    if (currentStatus === 'delivered') {
      return 'Confirmar recepción'
    }
  }
  return null
}
