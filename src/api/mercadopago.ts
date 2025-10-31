import { authAxios } from "./useAxios"

// Obtener la configuración de Mercado Pago del vendedor
export const get_mercadopago_config = async (sellerId: number) => {
  try {
    const response = await authAxios.get(`users/mercado-pago/config/done/${sellerId}/`)
    return response.data
  } catch (error: any) {
    // Si el error es 404 o no hay configuración, devolver un objeto sin credenciales
    if (error.response?.status === 404 || error.response?.status === 200) {
      return {
        public_key: null,
        access_token: null,
        user_id: sellerId
      }
    }
    console.error(`Error al obtener configuración de Mercado Pago del vendedor ${sellerId}:`, error)
    return {
      public_key: null,
      access_token: null,
      user_id: sellerId
    }
  }
}

// Guardar la configuración de Mercado Pago para un usuario
export const save_mercadopago_config = async (data: {
  user_id: number
  public_key: string
  access_token: string
}) => {
  try {
    // Validación de campos requeridos
    if (!data.user_id) {
      throw new Error("El user_id es requerido")
    }
    if (!data.public_key) {
      throw new Error("El public_key es requerido")
    }
    if (!data.access_token) {
      throw new Error("El access_token es requerido")
    }

    // Preparar el payload - solo enviar public_key y access_token
    // El user_id se obtiene del pk en la URL, y created_at/updated_at son automáticos
    const payload = {
      public_key: data.public_key,
      access_token: data.access_token,
    }

    // Asegúrate de que la URL coincida con la definida en tu backend
    const response = await authAxios.post(`users/mercado-pago/config/${data.user_id}/`, payload)

    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error saving MercadoPago config:", error)

    // Mejor manejo de errores
    let errorMessage = "Error al guardar la configuración"
    if (error.response) {
      if (error.response.data) {
        errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      } else {
        errorMessage = error.response.statusText || errorMessage
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}

