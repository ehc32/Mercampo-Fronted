import { authAxios } from "./useAxios"

// Funciones existentes
export const search_order = async (query: string) => {
  const response = await authAxios.get(`/orders/search/?query=${query}`)
  return response.data
}

export const edit_order = async (id: number) => {
  await authAxios.put(`/orders/deliver/${id}/`)
}

// Nueva función para actualizar el estado de la orden usando el sistema de estados
export const update_order_status = async (orderId: number, status: string) => {
  const response = await authAxios.patch(`/orders/${orderId}/status/`, { status })
  return response.data
}

export const get_orders = async () => {
  const response = await authAxios.get(`/orders/`)
  return response.data
}

export const solo_order = async (id: number) => {
  const response = await authAxios.get(`/orders/solo/${id}/`)
  return response.data
}

  export const notificarVendedor = async (ordenId: number) => {
    const response = await authAxios.post(`orders/confirm-received/${ordenId}/`)
    return response.data
  }


export const my_orders = async () => {
  const response = await authAxios.get("orders/my/orders/")
  return response.data
}

export const my_pending_orders = async () => {
  const response = await authAxios.get("orders/my/pending/")
  return response.data
}
export const seller_delivered_orders = async () => {
  const response = await authAxios.get("orders/my/seller/delivered/")
  return response.data
}

// Nueva función para obtener órdenes del vendedor por estado específico
export const seller_orders_by_status = async (statusType: string) => {
  const response = await authAxios.get(`/orders/my/seller/status/${statusType}/`)
  return response.data
}

export const create_order = async (data: FormData) => {
  await authAxios.post("/orders/create/", data)
}

export const get_order_items = async (orderId: number) => {
  const response = await authAxios.get(`/orders/${orderId}/items/`)
  return response.data
}

// Funciones para Mercado Pago - Modificada para usar seller_id
export const create_temp_preference = async (data: FormData) => {
  const response = await authAxios.post("orders/payment/temp_preference/", data)
  return response.data
}

export const check_payment_status = async (paymentId: string) => {
  const response = await authAxios.get(`orders/payment/status/${paymentId}/`)
  return response.data
}

export const finalize_order_on_success = async (data: { payment_id: string; external_reference: string }) => {
  const response = await authAxios.post("/orders/payment/finalize/", data)
  return response.data
}

