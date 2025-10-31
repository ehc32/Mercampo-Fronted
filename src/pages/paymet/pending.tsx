"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const PaymentPending = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState({
    paymentId: "",
    status: "",
    externalReference: "",
    paymentType: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener los parámetros de la URL
    const params = new URLSearchParams(location.search)
    const paymentId = params.get("payment_id") || ""
    const status = params.get("status") || ""
    const externalReference = params.get("external_reference") || ""
    const paymentType = params.get("payment_type") || ""

    setOrderDetails({
      paymentId,
      status,
      externalReference,
      paymentType,
    })

    toast.info("Tu pago está pendiente de confirmación")
    setLoading(false)
  }, [location])

  return (
    <section className="bg-white p-6 sm:p-10 mt-10">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago pendiente</h1>
          <p className="text-lg text-gray-600">Tu pago está siendo procesado y está pendiente de confirmación.</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles del pago</h2>
          {loading ? (
            <p>Cargando detalles...</p>
          ) : (
            <div className="space-y-2 text-left">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">ID de pago:</span>
                <span>{orderDetails.paymentId}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Estado:</span>
                <span className="text-yellow-600 font-semibold">Pendiente</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Tipo de pago:</span>
                <span>{orderDetails.paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Referencia:</span>
                <span>{orderDetails.externalReference}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            {orderDetails.paymentType === "ticket"
              ? "Debes completar el pago con el cupón generado. Una vez confirmado, procesaremos tu pedido."
              : "Estamos esperando la confirmación de tu pago. Te notificaremos cuando se complete."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </section>
  )
}

export default PaymentPending

