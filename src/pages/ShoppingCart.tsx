"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import {
  Typography,
  TextField,
  Button as MuiButton,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Fade,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Tooltip,
} from "@mui/material"
import {
  ArrowBack,
  Add,
  Remove,
  DeleteOutline,
  LocationOn,
  LocationCity,
  MarkunreadMailbox,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  ShoppingCartCheckout,
} from "@mui/icons-material"

import { create_order } from "../api/orders"
import { useCartStore } from "../hooks/cart"
import { get_paypal_user } from "../api/users"
import { get_mercadopago_config } from "../api/mercadopago"
import { create_temp_preference } from "../api/orders"
import { paypal_create, paypal_capture } from "../api/paypal"
import "./../global/style.css"

const CartPage = () => {
  const [paypal, setPaypal] = useState<any>()
  const [id, setPayPalUserId] = useState<any>()
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState(null)
  const cart = useCartStore((state) => state.cart)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paypal" | "mercadopago" | null>(null)
  const [formTouched, setFormTouched] = useState(false)

  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const addToCart = useCartStore((state) => state.addToCart)
  const removeAll = useCartStore((state) => state.removeAll)
  const removeProduct = useCartStore((state) => state.removeProduct)
  const total_price = useCartStore((state) => state.totalPrice)

  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postal_code, setPostal_code] = useState("")

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Set seller ID when cart changes
  useEffect(() => {
    if (cart.length > 0 && cart[0].user) {
      setPayPalUserId(cart[0].user)
    }
  }, [cart])

  // Fetch PayPal user data
  const paypalUser = async () => {
    try {
      if (!id) return
      const response = await get_paypal_user(id)
      const data = response.data
      setPaypal(data)
    } catch (e) {
      console.error("Error fetching PayPal user:", e)
    }
  }

  useEffect(() => {
    paypalUser()
  }, [id])

  // Fetch MercadoPago config
  useEffect(() => {
    const fetchMercadoPagoConfig = async () => {
      if (cart.length > 0 && cart[0].user) {
        try {
          const sellerId = cart[0].user
          const config = await get_mercadopago_config(sellerId)
          setMercadoPagoConfig(config)
        } catch (error) {
          console.error("Error fetching Mercado Pago config:", error)
        }
      }
    }

    fetchMercadoPagoConfig()
  }, [cart])

  // Create Mercado Pago preference
  const createMercadoPagoPreference = async () => {
    if (cart.length === 0) {
      toast.warning("No hay productos en el carrito")
      return
    }

    if (!address || !city || !postal_code) {
      toast.warning("Por favor completa los datos de envío")
      setFormTouched(true)
      return
    }

    setIsProcessing(true)
    setIsPageLoading(true)

    try {
      const formData = new FormData()
      formData.append("order_items", JSON.stringify(cart))
      formData.append("total_price", total_price.toString())
      formData.append("address", address)
      formData.append("city", city)
      formData.append("postal_code", postal_code)

      if (cart[0].user) {
        formData.append("seller_id", cart[0].user.toString())
      }

      const preference = await create_temp_preference(formData)

      if (preference && preference.init_point) {
        window.location.href = preference.init_point
      } else {
        toast.error("Error en la respuesta del servidor")
        setIsPageLoading(false)
      }
    } catch (error: any) {
      console.error("Error creating payment preference:", error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || "Error al crear preferencia de pago"
      toast.error(errorMessage, { autoClose: 5000 })
      setIsPageLoading(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Create order mutation
  const createOrderMut = useMutation({
    mutationFn: create_order,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("¡Orden creada exitosamente!")
      removeAll()
      navigate("/")
    },
    onError: () => {
      toast.error("¡Error al crear la orden!")
      setIsPageLoading(false)
      navigate("/")
    },
  })

// PayPal order creation (server-side)
  const createOrder = async () => {
    try {
      if (cart.length === 0) {
        toast.warning("No hay objetos para comprar")
        return;
      }
      if (!address || !city || !postal_code) {
        toast.warning("Completa los datos de envío")
        setFormTouched(true)
        return;
      }
      const payload = {
        order_items: cart,
        total_price: total_price.toString(),
        address,
        city,
        postal_code,
      }
      const res = await paypal_create(payload)
      return res.orderID
    } catch (e) {
      console.error(e)
      toast.error("No se pudo crear la orden de PayPal")
    }
  }

  // PayPal payment approval (server capture)
  const onApprove = async (data) => {
    try {
      setIsProcessing(true)
      setIsPageLoading(true)
      const r = await paypal_capture(data.orderID)
      if (r.status === 'approved' || r.status === 'COMPLETED' || r.status === 'completed') {
        toast.success("Pago completado ✅")
        removeAll()
        navigate("/")
      } else {
        toast.warning(`Estado de pago: ${r.status}`)
      }
    } catch (error) {
      console.error("Error en la captura de pago:", error)
      toast.error("Error al capturar el pago")
    } finally {
      setIsPageLoading(false)
      setIsProcessing(false)
    }
  }

  // Submit order
  const handleSubmit = (paymentMethod?: string, paymentId?: string) => {
    if (cart.length === 0) {
      toast.warning("No hay productos en el carrito")
      return
    }

    if (!address || !city || !postal_code) {
      toast.warning("Por favor completa los datos de envío")
      setFormTouched(true)
      return
    }

    setIsProcessing(true)
    setIsPageLoading(true)

    try {
      const formData = new FormData()
      formData.append("order_items", JSON.stringify(cart))
      formData.append("total_price", total_price.toString())
      formData.append("address", address)
      formData.append("city", city)
      formData.append("postal_code", postal_code)
      
      // Agregar payment_method y payment_id si están disponibles
      if (paymentMethod) {
        formData.append("payment_method", paymentMethod)
      }
      if (paymentId) {
        formData.append("payment_id", paymentId)
      }

      create_order(formData)
      toast.success("Se ha realizado correctamente su compra, espere a que llegue su pedido 😊")
      setTimeout(() => {
        removeAll()
        navigate("/")
      }, 2000)
    } catch (error) {
      toast.warning("Ha ocurrido un error al registrar su compra")
      setIsPageLoading(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = address && city && postal_code

  // Form validation helpers
  const getAddressError = () => {
    return formTouched && !address ? "La dirección es requerida" : ""
  }

  const getCityError = () => {
    return formTouched && !city ? "La ciudad es requerida" : ""
  }

  const getPostalCodeError = () => {
    return formTouched && !postal_code ? "El código postal es requerido" : ""
  }

  // Mercado Pago SVG con tamaño ajustado
  const MercadoPagoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48">
      <ellipse cx="23.5" cy="23.5" fill="#4fc3f7" rx="21.5" ry="15.5"></ellipse>
      <path
        fill="#fafafa"
        d="M22.471,24.946c-1.978-5.537-4.884-10.881-6.085-12.995c-0.352-0.619-0.787-1.186-1.29-1.69 l-2.553-2.553c-0.391-0.391-1.414,0-1.414,0L9.497,8.734l-0.162,2.319L8.773,11c-0.518,0-0.938,0.42-0.938,0.938 c0,0.52,0.413,0.969,0.933,0.961c1.908-0.03,3.567,1.601,3.567,1.601h2c0.32,0.32,1.139,1.366,1.328,2.439 c0.107,0.611,0.154,1.229,0.119,1.848C15.458,24.622,16.835,26,16.835,26c-5.5-3.5-14.819-2.964-14.819-2.964l0.193,3.016L5,31 c0.919,0.212,0.744-0.626,1.765-0.504c6.199,0.741,13.57,0.004,13.57,0.004c1.5,0,1.958-0.793,2.665-1.5 C24,28,22.849,26.004,22.471,24.946z"
      ></path>
      <path
        fill="#fafafa"
        d="M24.913,24.946c1.978-5.537,4.884-10.881,6.085-12.995c0.352-0.619,0.787-1.186,1.29-1.69 l2.553-2.553c0.391-0.391,1.414,0,1.414,0L37.814,9l0.235,2.053L38.611,11c0.518,0,0.938,0.42,0.938,0.938 c0,0.52-0.413,0.969-0.933,0.961c-1.908-0.03-3.567,1.601-3.567,1.601h-2c-0.32,0.32-1.139,1.366-1.328,2.439 c-0.107,0.611-0.154,1.229-0.119,1.848C31.926,24.622,30.549,26,30.549,26c5.5-3.5,15-3,15-3l-0.165,3l-3,5 c-0.919,0.212-0.744-0.626-1.765-0.504c-6.199,0.741-13.57,0.004-13.57,0.004c-1.5,0-1.958-0.793-2.665-1.5 C23.384,28,24.535,26.004,24.913,24.946z"
      ></path>
      <path
        fill="#1a237e"
        d="M43.832,16.326c-0.311-0.415-0.644-0.808-0.992-1.187c-0.059-0.064-0.123-0.123-0.183-0.186 c-0.309-0.326-0.628-0.639-0.96-0.938c-0.026-0.023-0.053-0.045-0.079-0.068c-0.587-0.522-1.201-1.012-1.845-1.454 c0.071-0.175,0.11-0.364,0.11-0.555c0-0.792-0.643-1.437-1.481-1.437c-0.001,0-0.003,0-0.004,0l-0.015,0.002V9.32 c0-0.534-0.288-1.032-0.75-1.299L36.269,7.24c-0.221-0.085-1.356-0.478-1.946,0.113l-1.837,1.838 c-0.381-0.106-0.89-0.25-1.211-0.326C28.893,8.288,26.446,8.014,24,8c-3.031-0.004-6.095,0.39-9.018,1.275l-1.921-1.921 c-0.59-0.59-1.725-0.199-2.018-0.079L9.75,8.021C9.288,8.288,9,8.786,9,9.32v1.186L8.938,10.5c-0.793,0-1.438,0.646-1.438,1.438 c0,0.311,0.103,0.614,0.283,0.865c-0.978,0.715-1.903,1.512-2.722,2.422c-0.315,0.35-0.616,0.715-0.9,1.096 C2.638,18.346,2.061,20.87,2,23.5c-0.035,2.628,0.455,5.223,1.932,7.343c1.478,2.132,3.451,3.854,5.624,5.163 c4.378,2.609,9.436,3.749,14.444,3.846c2.511-0.026,5.023-0.319,7.471-0.924c2.442-0.624,4.81-1.582,6.986-2.9 c2.163-1.328,4.143-3.041,5.617-5.18c1.476-2.122,1.932-4.719,1.894-7.347C45.905,20.87,45.357,18.348,43.832,16.326z M40.793,15.139c0.229,0.225,0.448,0.459,0.662,0.697c0.096,0.107,0.195,0.211,0.288,0.32c0.293,0.347,0.573,0.703,0.828,1.076 c1.088,1.579,1.785,3.39,1.957,5.242c-2.274-0.031-8.444,0.114-13.042,2.342c0.335-1.133,0.619-3.016,0.449-6.058 c-0.03-0.552,0.008-1.135,0.113-1.733c0.139-0.79,0.702-1.618,1.054-2.026h0.727c0.731,0,1.432-0.224,2.025-0.647 c0.624-0.444,1.559-0.981,2.588-0.954c0.072,0,0.139-0.03,0.21-0.04c0.267,0.192,0.536,0.383,0.792,0.587 c0.076,0.061,0.15,0.124,0.225,0.186c0.273,0.224,0.538,0.457,0.795,0.696C40.576,14.93,40.686,15.034,40.793,15.139z M24,9 c2.369,0.026,4.734,0.303,7.027,0.87c0.208,0.053,0.412,0.118,0.617,0.181c-0.482,0.503-0.906,1.054-1.246,1.652 c-1.175,2.068-4.124,7.483-6.121,13.075c-0.075,0.208-0.163,0.43-0.255,0.66c-0.112,0.281-0.226,0.572-0.331,0.868 c-0.104-0.296-0.219-0.588-0.331-0.868c-0.092-0.23-0.18-0.452-0.255-0.66c-2-5.599-4.947-11.009-6.121-13.075 c-0.297-0.523-0.667-1.004-1.074-1.456C18.522,9.461,21.264,9.054,24,9z M5.435,17.238c0.251-0.364,0.524-0.713,0.811-1.052 c0.094-0.112,0.196-0.218,0.294-0.327c0.202-0.225,0.408-0.448,0.625-0.662c0.115-0.114,0.233-0.224,0.351-0.335 c0.229-0.213,0.463-0.421,0.704-0.622c0.099-0.083,0.198-0.166,0.299-0.247c0.243-0.193,0.495-0.376,0.748-0.558 c0.886,0.089,1.707,0.522,2.262,0.918C12.123,14.776,12.823,15,13.555,15h0.727c0.352,0.407,0.915,1.235,1.054,2.026 c0.105,0.597,0.143,1.18,0.113,1.733c-0.17,3.042,0.114,4.927,0.449,6.059c-4.193-2.029-9.734-2.333-12.425-2.344 C3.648,20.623,4.346,18.814,5.435,17.238z M6.236,30.271c-0.192-0.224-0.396-0.437-0.572-0.673 C4.329,27.826,3.49,25.705,3.426,23.5c0-0.008,0.001-0.017,0.001-0.025c2.878,0.006,9.226,0.351,13.305,2.947 c0.211,0.134,0.484,0.088,0.646-0.104c0.162-0.19,0.153-0.477-0.014-0.662c-0.012-0.014-1.218-1.422-0.916-6.842 c0.035-0.63-0.007-1.29-0.126-1.962c-0.218-1.235-1.133-2.372-1.467-2.706C14.76,14.053,14.632,14,14.5,14h-0.945 c-0.522,0-1.021-0.159-1.445-0.462c-0.745-0.531-1.925-1.147-3.185-1.14c-0.131,0.004-0.226-0.063-0.281-0.117 C8.552,12.192,8.5,12.067,8.5,11.938c0-0.242,0.196-0.438,0.391-0.44l0.562,0.054c0.111,0.007,0.216-0.027,0.308-0.084l0.386,0.386 C10.242,11.949,10.37,12,10.5,12c0.053,0,0.106-0.009,0.158-0.025l1.207-0.402l1.281,1.281C13.244,12.951,13.372,13,13.5,13 s0.256-0.049,0.354-0.146c0.195-0.195,0.195-0.512,0-0.707L12.707,11l0.146-0.146C12.951,10.756,13,10.628,13,10.5 s-0.049-0.256-0.146-0.354l-1-1c-0.195-0.195-0.512-0.195-0.707,0C11.049,9.244,11,9.372,11,9.5s0.049,0.256,0.146,0.354 l0.646,0.646l-0.063,0.063l-1.095,0.365L10,10.293V9.32c0-0.178,0.096-0.344,0.25-0.434l1.22-0.712 c0.365-0.139,0.792-0.179,0.883-0.114l2.554,2.554c0.475,0.475,0.882,1.007,1.209,1.583c1.161,2.043,4.076,7.393,6.049,12.917 c0.078,0.219,0.171,0.452,0.267,0.694c0.347,0.871,0.741,1.858,0.58,2.583C22.808,29.309,21.728,30,20.49,30 c-0.07,0.002-7.123,0.139-13.425,0.011C6.798,30.002,6.509,30.114,6.236,30.271z M37.217,33.918 c-1.98,1.119-4.156,1.898-6.385,2.419c-2.228,0.539-4.528,0.798-6.832,0.812c-4.592,0.01-9.259-0.951-13.23-3.208 c-1.401-0.799-2.709-1.764-3.832-2.891c0.036-0.014,0.083-0.038,0.107-0.039C13.367,31.138,20.439,31.001,20.5,31 c1.396,0,2.616-0.673,3.192-1.67c0.575,0.997,1.794,1.67,3.182,1.67c0.071,0.002,7.146,0.139,13.462,0.011 c0.089,0.003,0.272,0.102,0.483,0.249C39.748,32.289,38.531,33.185,37.217,33.918z M42.329,29.593 c-0.247,0.329-0.526,0.635-0.803,0.941c-0.37-0.273-0.81-0.524-1.192-0.524c-0.005,0-0.011,0-0.017,0 c-6.3,0.125-13.354-0.01-13.434-0.011c-1.228,0-2.308-0.691-2.512-1.608c-0.161-0.725,0.232-1.712,0.58-2.583 c0.096-0.242,0.189-0.476,0.267-0.694c1.971-5.518,4.887-10.871,6.049-12.917c0.327-0.576,0.734-1.108,1.209-1.583l2.55-2.551 C35.122,8,35.548,8.037,35.841,8.14l1.293,0.747c0.154,0.09,0.25,0.256,0.25,0.434v0.973l-0.635,0.635l-1.095-0.365L35.591,10.5 l0.646-0.646c0.098-0.098,0.146-0.226,0.146-0.354s-0.049-0.256-0.146-0.354c-0.195-0.195-0.512-0.195-0.707,0l-1,1 c-0.098,0.098-0.146,0.226-0.146,0.354s0.049,0.256,0.146,0.354L34.677,11l-1.146,1.146c-0.195,0.195-0.195,0.512,0,0.707 C33.628,12.951,33.756,13,33.884,13s0.256-0.049,0.354-0.146l1.281-1.281l1.207,0.402C36.777,11.991,36.831,12,36.884,12 c0.13,0,0.258-0.051,0.354-0.146l0.386-0.386c0.092,0.057,0.197,0.092,0.308,0.084l0.515-0.052c0.242,0,0.438,0.196,0.438,0.438 c0,0.129-0.052,0.254-0.143,0.343c-0.056,0.055-0.157,0.109-0.282,0.117c-1.279,0.011-2.439,0.608-3.185,1.14 C34.851,13.841,34.352,14,33.83,14h-0.946c-0.133,0-0.26,0.053-0.354,0.146c-0.334,0.334-1.25,1.473-1.467,2.706 c-0.118,0.674-0.161,1.334-0.126,1.963c0.302,5.419-0.904,6.827-0.907,6.831c-0.18,0.181-0.196,0.468-0.037,0.666 c0.159,0.199,0.442,0.246,0.659,0.109c4.408-2.805,11.576-2.969,13.922-2.942c0,0.007,0.001,0.013,0.001,0.02 C44.507,25.705,43.666,27.824,42.329,29.593z"
      ></path>
    </svg>
  )

  return (
    <div className="bg-gray-50 min-h-screen py-8 relative">
      {/* Full-page loading overlay */}
      {isPageLoading && (
        <Fade in={isPageLoading}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} sx={{ color: "#39A900", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Procesando su pedido...
            </Typography>
          </Box>
        </Fade>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center">
          <MuiButton
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              color: "#333",
              fontWeight: 500,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              borderRadius: "8px",
            }}
          >
            Continuar Comprando
          </MuiButton>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <Typography variant="h5" className="font-bold mb-2">
              Tu carrito está vacío
            </Typography>
            <Typography variant="body1" color="textSecondary" className="mb-6">
              Parece que aún no has agregado productos a tu carrito
            </Typography>
            <MuiButton
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "#39A900",
                "&:hover": { bgcolor: "#2c7d00" },
                px: 4,
                py: 1.5,
                borderRadius: "10px",
                transition: "all 0.2s ease",
              }}
            >
              Explorar Productos
            </MuiButton>
          </div>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Cart Items */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Carrito de Compras
                    </Typography>
                    <Chip
                      label={`${cart.length} ${cart.length === 1 ? "item" : "items"}`}
                      size="small"
                      sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "medium" }}
                    />
                  </div>

                  {/* Tabla de productos con más espacio vertical */}
                  <Box sx={{ maxHeight: "500px", overflowY: "auto", mb: 2 }}>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <Card
                          key={item.id}
                          sx={{
                            mb: 2,
                            border: "1px solid #f0f0f0",
                            boxShadow: "none",
                            transition: "all 0.2s",
                            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <div className="flex items-center">
                              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                {item.image ? (
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-10 h-10 object-contain"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Typography variant="body2" className="font-bold text-teal-700">
                                      {item.name.substring(0, 2).toUpperCase()}
                                    </Typography>
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow">
                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{
                                    fontSize: "0.875rem",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.description ? item.description.substring(0, 30) + "..." : "Producto"}
                                </Typography>
                              </div>

                              <div className="flex items-center space-x-4 ml-2">
                              <div className="flex items-center border border-gray-200 rounded-lg">
                                <Tooltip title="Reducir cantidad" arrow placement="top">
                                  <IconButton size="small" onClick={() => removeFromCart(item)} sx={{ color: "#666" }}>
                                    <Remove fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Typography
                                  variant="body2"
                                  sx={{ width: "30px", textAlign: "center", fontWeight: 500 }}
                                >
                                  {item.quantity}
                                </Typography>
                                
                                <Tooltip title="Aumentar cantidad" arrow placement="top">
                                  <IconButton size="small" onClick={() => addToCart(item)} sx={{ color: "#39A900" }}>
                                    <Add fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </div>

                              <Tooltip title="Eliminar producto" arrow placement="top">
                                <IconButton size="small" onClick={() => removeProduct(item)} sx={{ color: "#f44336" }}>
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </Box>

                  {/* Resumen del total de productos */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f9f9f9",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ShoppingCartCheckout sx={{ color: "#39A900", mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Total de productos:
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#39A900" }}>
                        ${total_price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>

                  {cart.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <MuiButton
                        variant="outlined"
                        color="error"
                        onClick={() => removeAll()}
                        startIcon={<DeleteOutline />}
                        size="small"
                        sx={{ borderRadius: "8px" }}
                      >
                        Vaciar Carrito
                      </MuiButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Checkout */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Datos de Envío
                    </Typography>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#39A900" }}>
                      <LocationOn fontSize="small" />
                    </Avatar>
                  </div>

                  <div className="space-y-4">
                    <TextField
                      fullWidth
                      label="Dirección de envío"
                      placeholder="Ej: Calle 123 #45-67"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      variant="outlined"
                      error={!!getAddressError()}
                      helperText={getAddressError()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ color: "rgba(0,0,0,0.54)" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ciudad"
                          placeholder="Ej: Bogotá"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          variant="outlined"
                          error={!!getCityError()}
                          helperText={getCityError()}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCity sx={{ color: "rgba(0,0,0,0.54)" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Código Postal"
                          placeholder="Ej: 110111"
                          value={postal_code}
                          onChange={(e) => setPostal_code(e.target.value)}
                          required
                          variant="outlined"
                          error={!!getPostalCodeError()}
                          helperText={getPostalCodeError()}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MarkunreadMailbox sx={{ color: "rgba(0,0,0,0.54)" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Método de Pago
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Card
                        onClick={() => setSelectedPaymentMethod("paypal")}
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: selectedPaymentMethod === "paypal" ? "2px solid #39A900" : "1px solid #e0e0e0",
                          boxShadow: selectedPaymentMethod === "paypal" ? "0 0 0 2px rgba(57, 169, 0, 0.1)" : "none",
                          position: "relative",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: selectedPaymentMethod === "paypal" ? "#39A900" : "#bdbdbd",
                          },
                        }}
                      >
                        <img
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                          alt="PayPal"
                          className="h-8 mb-2"
                        />
                        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
                          PayPal
                        </Typography>
                        {selectedPaymentMethod === "paypal" && (
                          <CheckCircle
                            sx={{
                              color: "#39A900",
                              fontSize: 16,
                              position: "absolute",
                              top: 8,
                              right: 8,
                            }}
                          />
                        )}
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card
                        onClick={() => setSelectedPaymentMethod("mercadopago")}
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: selectedPaymentMethod === "mercadopago" ? "2px solid #39A900" : "1px solid #e0e0e0",
                          boxShadow:
                            selectedPaymentMethod === "mercadopago" ? "0 0 0 2px rgba(57, 169, 0, 0.1)" : "none",
                          position: "relative",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: selectedPaymentMethod === "mercadopago" ? "#39A900" : "#bdbdbd",
                          },
                        }}
                      >
                        <MercadoPagoIcon />
                        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500, mt: 1 }}>
                          Mercado Pago
                        </Typography>
                        {selectedPaymentMethod === "mercadopago" && (
                          <CheckCircle
                            sx={{
                              color: "#39A900",
                              fontSize: 16,
                              position: "absolute",
                              top: 8,
                              right: 8,
                            }}
                          />
                        )}
                      </Card>
                    </Grid>
                  </Grid>

                  {selectedPaymentMethod === "paypal" && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <PayPalScriptProvider
                        options={{
                          clientId: paypal?.client_id || "test_client_id",
                        }}
                      >
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          style={{ layout: "horizontal", color: "blue" }}
                          disabled={cart.length === 0 || !isFormValid || isProcessing}
                        />
                      </PayPalScriptProvider>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 3 }}>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ${total_price.toLocaleString()}
                      </Typography>
                    </div>

                    <div className="flex justify-between">
                      <Typography variant="body1">Envío</Typography>
                      <Typography variant="body1" sx={{ color: "#2e7d32", fontWeight: 500 }}>
                        Gratis
                      </Typography>
                    </div>

                    <Divider sx={{ my: 1.5 }} />

                    <div className="flex justify-between">
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#39A900" }}>
                        ${total_price.toLocaleString()}
                      </Typography>
                    </div>
                  </div>

                  {selectedPaymentMethod === "mercadopago" ? (
                    mercadoPagoConfig && mercadoPagoConfig.public_key && mercadoPagoConfig.access_token ? (
                      <MuiButton
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          if (!isFormValid) {
                            setFormTouched(true)
                            toast.warning("Por favor completa los datos de envío")
                          } else {
                            createMercadoPagoPreference()
                          }
                        }}
                        disabled={isProcessing}
                        sx={{
                          mt: 3,
                          bgcolor: "#009EE3",
                          "&:hover": { bgcolor: "#0088C7" },
                          py: 1.5,
                          borderRadius: "10px",
                          fontWeight: "bold",
                          transition: "all 0.2s ease",
                          textTransform: "none",
                        }}
                      >
                        {isProcessing ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                            Procesando...
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MercadoPagoIcon />
                            <Typography sx={{ ml: 1, fontWeight: "bold" }}>
                              Pagar con Mercado Pago
                            </Typography>
                          </Box>
                        )}
                      </MuiButton>
                    ) : (
                      <Box sx={{ mt: 3, p: 2, bgcolor: "#fff3cd", borderRadius: 2, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "#856404" }}>
                          ⚠️ El vendedor no ha configurado Mercado Pago. Por favor, selecciona otro método de pago.
                        </Typography>
                      </Box>
                    )
                  ) : (
                    <MuiButton
                      fullWidth
                      variant="contained"
                      disabled={true}
                      sx={{
                        mt: 3,
                        bgcolor: "#e0e0e0",
                        py: 1.5,
                        borderRadius: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      Selecciona un método de pago
                    </MuiButton>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  )
}

export default CartPage

