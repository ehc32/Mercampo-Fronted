"use client"

import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useCartStore } from "../../hooks/cart"
import { authAxios } from "../../api/useAxios"
import { get_all_products } from "../../api/products"
import RandomProducts from "../../components/home/RandomProducts"

const PaymentSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const removeAll = useCartStore((state) => state.removeAll)
  const [productosRandom, setProductosRandom] = useState([])

  const [orderDetails, setOrderDetails] = useState({
    paymentId: "",
    status: "",
    externalReference: "",
    orderId: null,
  })
  const [loading, setLoading] = useState(true)
  const hasFinalizedRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const paymentId = params.get("payment_id") || params.get("collection_id") || ""
    const status = params.get("status") || ""
    const externalReference = params.get("external_reference") || ""

    setOrderDetails({
      paymentId,
      status,
      externalReference,
      orderId: null,
    })

    const finalizeOrder = async () => {
      if (hasFinalizedRef.current) return
      hasFinalizedRef.current = true
      if (paymentId && externalReference) {
        try {
          const response = await authAxios.post("/orders/payment/finalize/", {
            payment_id: paymentId,
            external_reference: externalReference,
          })

          const data = response.data || {}
          if (data.order_id) {
            setOrderDetails((prev) => ({
              ...prev,
              orderId: data.order_id,
            }))
          }

          // Fallback: disparar webhook para notificación server-to-server en pruebas
          try {
            await fetch("https://99729b8625b9.ngrok-free.app/orders/payment/webhook/", {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "payment", data: { id: paymentId } }),
            })
          } catch (e) {
            console.warn("Webhook fallback call failed (ignored):", e)
          }

          removeAll()
          toast.success("¡Pago completado y orden creada con éxito!")
        } catch (error) {
          console.error("Error al finalizar la orden:", error)
          toast.error("Error al finalizar la orden. Inténtalo de nuevo.")
        }
      }
      setLoading(false)
    }

    finalizeOrder()
  }, [location, removeAll])

  const fetchProductos = async () => {
    try {
      const productos = await get_all_products()
      setProductosRandom(productos)
    } catch (error) {
      console.error("Error al obtener los productos: ", error)
    }
  }

  useEffect(() => {
    void fetchProductos()
  }, [])

  return (
    <div className="bg-white">
      <section className="bg-white p-6 sm:p-10 pt-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h1>
            <p className="text-lg text-gray-600 mb-4">
              ¡Listo! Ahora puedes seguir disfrutando de nuestros productos.
            </p>
            <p className="text-sm text-gray-500 italic">
              *Recuerda que solo puedes comprar un producto por vendedor. Si quieres más, compra otro carrito aparte.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles del pago</h2>
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-2">Verificando pago...</span>
              </div>
            ) : (
              <div className="space-y-2 text-left">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">ID de pago:</span>
                  <span>{orderDetails.paymentId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Estado:</span>
                  <span className="text-green-600 font-semibold">Aprobado</span>
                </div>
                {orderDetails.orderId && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Número de orden:</span>
                    <span>{orderDetails.orderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Referencia:</span>
                  <span>{orderDetails.externalReference}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-12">
            <p className="text-gray-600">
              Hemos recibido tu pago y estamos procesando tu pedido. Recibirás un correo electrónico con los detalles de
              tu compra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Volver a la tienda
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ver mis pedidos
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Descubre más productos</h2>
        <RandomProducts productos={productosRandom} />
      </section>
    </div>
  )
}

export default PaymentSuccess