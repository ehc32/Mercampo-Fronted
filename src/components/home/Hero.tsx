import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Style.css";
import { useAuthStore } from "../../hooks/auth";
import jwt_decode from 'jwt-decode';
import { useEffect, useState } from "react";
import { Token } from '../../Interfaces';
import { toast } from "react-toastify";


const Hero = () => {

  const [roleLocal, setRoleLocal] = useState()
  const { isAuth, access } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate(); ("");

  useEffect(() => {
    const setRoleFromToken = () => {
      const token: string | null = access;
      if (token) {
        try {
          const tokenDecoded: Token = jwt_decode(token);
          const userRole = tokenDecoded.role;
          setRoleLocal(userRole);
        } catch (error) {
          console.error("Error al decodificar el token:", error);
        }
      } else {
        setRoleLocal("");
      }
    };

    setRoleFromToken();

  }, [access]);

  return (
    <section
      className="w-full  h-[55vh] bg-center flex flex-col justify-center items-center relative bg-no-repeat bg-cover"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)),  url('/public/kaka.webp')`
      }}>
      <div className="container mx-auto px-6 lg:px-12 text-left">
        <div className="max-w-lg">
          <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Descubre las mejores ofertas
          </h1>
          <p className="text-white text-lg lg:text-xl mb-8 font-bold">
            En nuestra tienda online encontrarás los productos que necesitas
          </p>
          <Link to="/store">
            <button className="mr-2 bg-[#39A900] hover:bg-green hover:bg-lime-700 text-white text-lg font-bold py-3 m-1 px-6 rounded-full focus:outline-none">
              ¡Compra ahora!
            </button>
          </Link>
          {
            isAuth ? (

              roleLocal === "seller" || roleLocal === "admin" ? (

                <Link to={'/addprod'}>
                  <button className="bg-[#fff] hover:bg-green hover:bg-lime-700 hover:text-white text-[#39A900] text-lg m-1 font-bold py-3 px-6 rounded-full focus:outline-none">
                    Vender ahora!
                  </button>
                </Link>
              ) : (
                <Link to={'/profile'} onClick={() => toast.success('No eres vendedor pero puedes solicitar serlo en la configuración')}>

                  <button className="bg-[#fff] hover:bg-green hover:bg-lime-700 hover:text-white text-[#39A900] text-lg m-1 font-bold py-3 px-6 rounded-full focus:outline-none">
                    Vender ahora!
                  </button>
                </Link>
              )
            ) : (
              <Link to={'/login'}>
                <button className="bg-[#fff] hover:bg-green hover:bg-lime-700 hover:text-white text-[#39A900] text-lg m-1 font-bold py-3 px-6 rounded-full focus:outline-none">
                  Vender ahora!
                </button>
              </Link>
            )
          }
        </div>
      </div>
    </section>
  );
};

export default Hero;
