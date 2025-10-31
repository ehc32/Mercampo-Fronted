import { authAxios } from "./useAxios"

export interface Notification {
  id: number
  user: number
  message: string
  order_id: number | null
  is_read: boolean
  created_at: string
}

export const getNotifications = async () => {
  const response = await authAxios.get("orders/notifications/")
  return response.data
}

export const markNotificationAsRead = async (notificationId: number) => {
  const response = await authAxios.patch(`orders/notifications/${notificationId}/mark-as-read/`)
  return response.data
}

export const confirmOrderReceived = async (orderId: number) => {
  const response = await authAxios.post(`/orders/confirm/${orderId}/`)
  return response.data
}

export const checkOrderConfirmation = async (orderId: number) => {
    try {
      const response = await authAxios.get(`/orders/confirmation-status/${orderId}/`)
      return response.data
    } catch (error) {
      console.error("Error checking order confirmation:", error)
      return { confirmed: false }
    }
  }
