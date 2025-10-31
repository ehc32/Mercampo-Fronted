import React from 'react';

const PaypalIntro = () => {
    return (
      <section className="paypal-intro bg-gray-100 py-6" style={{ fontFamily: "Nunito, sans-serif" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mantén este bloque sin cambios */}
          <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">
            <span className="text-[#39A900]">Pago Seguro</span> con PayPal
          </h2>
          <p className="text-gray-700 mb-4 text-justify" style={{ fontSize: "16px" }}>
            En nuestra tienda en línea, te ofrecemos la opción de pagar con PayPal, una de las plataformas de pago más
            seguras y confiables del mundo. Con PayPal, puedes realizar tus compras de manera rápida y sencilla, con la
            tranquilidad de que tus datos están protegidos.
          </p>
          {/* Sección con texto e imagen */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-4 flex flex-col lg:flex-row items-start">
            {/* Texto a la izquierda */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontSize: "18px" }}>
                Ventajas de Usar PayPal
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-justify">
                <li style={{ fontSize: "16px" }}>
                  <strong className="text-gray-800">Seguridad:</strong> PayPal utiliza tecnología avanzada para proteger
                  tus datos financieros y personales, reduciendo el riesgo de fraude.
                </li>
                <li style={{ fontSize: "16px" }}>
                  <strong className="text-gray-800">Comodidad:</strong> Puedes pagar con tu cuenta de PayPal sin necesidad
                  de ingresar tus datos bancarios cada vez que realices una compra.
                </li>
                <li style={{ fontSize: "16px" }}>
                  <strong className="text-gray-800">Accesibilidad:</strong> PayPal está disponible en más de 200 países y
                  admite múltiples monedas, facilitando las compras internacionales.
                </li>
                <li style={{ fontSize: "16px" }}>
                  <strong className="text-gray-800">Rápido y Sencillo:</strong> Completa tus pagos en cuestión de minutos
                  con solo unos clics, sin necesidad de complicadas verificaciones.
                </li>
                <li style={{ fontSize: "16px" }}>
                  <strong className="text-gray-800">Protección al Comprador:</strong> PayPal ofrece protección para
                  compras, ayudándote a resolver cualquier problema que puedas encontrar con tus pedidos.
                </li>
              </ul>
            </div>
            {/* Imagen a la derecha */}
            <div className="mt-4 lg:mt-0 lg:ml-6 flex justify-end m-auto">
              <img
                src="/public/paypal_logo.png"
                alt="Imagen de seguridad de PayPal"
                className="h-32 w-auto mt-3 justify-between"
              />
            </div>
          </div>
          <p className="text-gray-700 text-justify" style={{ fontSize: "16px" }}>
            Al elegir PayPal como método de pago, no solo estás optando por una transacción segura, sino también por una
            experiencia de compra sin complicaciones. ¡Compra con confianza y disfruta de tus productos!
          </p>
        </div>
      </section>
    )
  }
  
  export default PaypalIntro
  
  