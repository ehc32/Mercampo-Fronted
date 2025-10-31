const MercadoPagoIntro = () => {
  return (
    <section className="mercadopago-intro bg-gray-100 py-6" style={{ fontFamily: "Nunito, sans-serif" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">
          <span className="text-[#39A900]">Pago seguro</span> con Mercado Pago
        </h2>
        <p className="text-gray-700 mb-4 text-justify" style={{ fontSize: "16px" }}>
          También puedes pagar con Mercado Pago, la pasarela líder en Latinoamérica. Realiza tus compras de forma rápida
          y 100% segura, con múltiples medios de pago (tarjetas, PSE, efectivo) y aprobación inmediata.
        </p>
        <div className="bg-white shadow-md rounded-lg p-6 mb-4 flex flex-col lg:flex-row items-start">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontSize: "18px" }}>
              Ventajas de usar Mercado Pago
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-justify">
              <li style={{ fontSize: "16px" }}>
                <strong className="text-gray-800">Variedad de medios:</strong> tarjetas débito/crédito, PSE y efectivo en
                puntos autorizados.
              </li>
              <li style={{ fontSize: "16px" }}>
                <strong className="text-gray-800">Aprobación rápida:</strong> pagos procesados al instante para no detener tu compra.
              </li>
              <li style={{ fontSize: "16px" }}>
                <strong className="text-gray-800">Seguridad:</strong> estándares de clase mundial y detección de fraude en tiempo real.
              </li>
              <li style={{ fontSize: "16px" }}>
                <strong className="text-gray-800">Experiencia simple:</strong> pocas pantallas, sin fricciones y compatible con dispositivos móviles.
              </li>
              <li style={{ fontSize: "16px" }}>
                <strong className="text-gray-800">Soporte local:</strong> pensado para Latinoamérica, con disponibilidad y moneda locales.
              </li>
            </ul>
          </div>
          <div className="mt-4 lg:mt-0 lg:ml-6 flex justify-end m-auto">
            <img
              src="/public/mercadopago_logo.png"
              alt="Logo Mercado Pago"
              className="h-24 w-auto mt-3"
            />
          </div>
        </div>
        <p className="text-gray-700 text-justify" style={{ fontSize: "16px" }}>
          Al elegir Mercado Pago tendrás una experiencia de pago confiable y local. Si el vendedor tiene sus credenciales
          configuradas, verás el botón oficial en el carrito y podrás completar tu compra en pocos pasos.
        </p>
      </div>
    </section>
  )
}

export default MercadoPagoIntro
