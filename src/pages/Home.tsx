import React, { useEffect, useState } from "react";
import { get_all_products } from "../api/products";
import About from "../components/home/About/About";
import Hero from "../components/home/Hero";
// import Participants from "../components/home/Participants/Participants";
import RandomProducts from "../components/home/RandomProducts";
import PaypalIntro from "../components/home/paypalInfo";
import MercadoPagoIntro from "../components/home/mercado-pago-intro";
import { CircularProgress, Box } from "@mui/material";

export default function Tienda() {
  const [productosRandom, setProductosRandom] = useState([]);
  const [loading, setLoading] = useState(true);

  // const people = [
  //   {
  //     name: "Yan Carlos Cerquera",
  //     photo: "/public/carlos.jpeg",
  //     role: "Ingeniero Electronico"
  //   },
  //   {
  //     name: "Edgar Eduardo Olarte",
  //     photo: "/public/eduar.jpeg",
  //     role: "Ingeniero de Sistemas"
  //   },
  //   {
  //     name: "Nicolás Cerquera Nieva",
  //     photo: "/public/Nicolas.jpeg",
  //     role: "Tecnólogo en ADSO"
  //   },
  //   {
  //     name: "Juan Nicolás Escobar",
  //     photo: "/public/escobar.jpeg",
  //     role: "Tecnólogo en ADSO"
  //   },
  // ];

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const productos = await get_all_products();
      setProductosRandom(productos);
    } catch (error) {
      console.error("Error al obtener los productos: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProductos();
  }, []);

  return (
    <React.Fragment>
      <div className="home-container">
        <Hero />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', py: 8 }}>
            <CircularProgress sx={{ color: '#39A900' }} size={60} />
          </Box>
        ) : (
          <RandomProducts productos={productosRandom as any} />
        )}
        <div className="payment-intros">
          <PaypalIntro />
          <MercadoPagoIntro />
        </div>
        <About />
        {/* <Participants people={people} /> */}
      </div>
    </React.Fragment>
  );
}
