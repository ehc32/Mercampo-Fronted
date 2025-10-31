import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ImageInput from "../components/assets/imageInput/ImageInput";
import ProductList from "../components/enterprise/productList";
import jwt_decode from 'jwt-decode';
import './../global/style.css';
import { sendEnterpriseRequest } from "../api/users";
import { useAuthStore } from "../hooks/auth";
import { Token } from "../Interfaces";
import { useNavigate } from "react-router-dom";

const AddEnterprise = () => {
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccionEmpresa, setDireccionEmpresa] = useState("");
  const [descripcionEmpresa, setDescripcionEmpresa] = useState("");
  const [linkEmpresa, setLinkEmpresa] = useState("");
  const [avatarEmpresa, setAvatarEmpresa] = useState([]);
  const [rutEmpresa, setRutEmpresa] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const validateField = (type, value) => {
    const validations = {
      phone: (value) => /^\d{10}$/.test(value),
      url: (value) => /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w._~:/?#[\]@!$&'()*+,;=]*)?$/.test(value),
      name: (value) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(value),
    };

    return validations[type](value);
  };


  const { access } = useAuthStore();

  useEffect(() => {
    const setRoleFromToken = () => {
      const token: string | null = access;
      if (token) {
        try {
          const tokenDecoded: Token = jwt_decode(token);
          const userId = tokenDecoded.userId;
          setUserId(userId.toString())
        } catch (error) {
          console.error("Error al decodificar el token:", error);
        }
      } else {
        setUserId("");
      }
    };

    setRoleFromToken();

  }, [access]);


  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!nombreEmpresa || !telefonoEmpresa || !direccionEmpresa || !descripcionEmpresa) {
      toast.error("Por favor, complete todos los campos obligatorios");
      return;
    }

    if (productos.length === 0) {
      toast.warning("Debe incluir mínimo un tipo de producto a vender.");
      return;
    }

    // Validar campos específicos
    if (!validateField("phone", telefonoEmpresa)) {
      toast.warning("El teléfono debe tener exactamente 10 números.");
      return;
    }

    if (facebook && !validateField("url", facebook)) {
      toast.warning("Ingrese una URL válida para Facebook.");
      return;
    }

    if (instagram && !validateField("url", instagram)) {
      toast.warning("Ingrese una URL válida para Instagram.");
      return;
    }

    if (whatsapp && !validateField("phone", whatsapp)) {
      toast.warning("El número de WhatsApp debe tener exactamente 10 números.");
      return;
    }

    if (!validateField("name", nombreEmpresa)) {
      toast.warning("El nombre de la empresa solo puede contener letras y espacios.");
      return;
    }

    setIsLoading(true);

    // Crear FormData
    const formData = new FormData();
    formData.append('name', nombreEmpresa);
    formData.append('phone', telefonoEmpresa);
    formData.append('tipo_productos', productos.join(',')); // Concatenar productos
    formData.append('facebook', facebook || '');
    formData.append('instagram', instagram || '');
    formData.append('whatsapp', whatsapp || '');
    formData.append('address', direccionEmpresa);
    formData.append('description', descripcionEmpresa);
    formData.append('link_enterprise', linkEmpresa || '');

    // Adjuntar avatar y rut (asegúrate de que solo pase el valor base64)
    formData.append('avatar', avatarEmpresa[0]); // Tomar el primer elemento
    formData.append('rut', rutEmpresa[0]); // Tomar el primer elemento

    try {
      await sendEnterpriseRequest(userId, formData);
      toast.success("Solicitud enviada exitosamente");

      setTimeout(() => {
        setIsLoading(false);
        navigate('/profile');
      }, 2000);

      setFacebook("");
      setInstagram("");
      setLinkEmpresa("");
      setTelefonoEmpresa("");
      setNombreEmpresa("");
      setWhatsapp("");
      setDescripcionEmpresa("");
      setDireccionEmpresa("");

    } catch (warning) {
      toast.warning("Este usuario ya pertenece a una empresa.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className="w-full flex m-auto dark:bg-gray-800 rounded-xl shadow-lg card-addprod">
        <div className="w-full p-4 md:p-10 card-bordered">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl text-black font-bold">Crear mi empresa</h1>
            <img src="/public/logoSena.png" alt="Logo-sena" className="h-12 md:h-16" />
          </div>
          <p className="my-2 text-black fs-16px">Para crear su empresa debe tener en cuenta que debe estar instituida o al menos enviar un comprobante de que su empresa realmente existe para poder ser tomada en cuenta, de otra manera se rechazará su solicitud de crear empresa.</p>
          <form onSubmit={manejarSubmit} className="space-y-2 md:space-y-6">
            <h2 className="text-xl font-bold text-black">Información de la Empresa</h2>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <h6 className="text-black font-bold m-1 fs-16px">Nombre de la Empresa</h6>
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
                  placeholder="Nombre de la empresa"
                  className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  required
                />
              </div>
              <div className="flex-1">
                <h6 className="text-black font-bold m-1 fs-16px">Teléfono</h6>
                <input
                  type="text"
                  value={telefonoEmpresa}
                  onChange={(e) => setTelefonoEmpresa(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  minLength={10}
                  inputMode="numeric"
                  placeholder="Teléfono de la empresa"
                  className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  required
                />
              </div>
            </div>

            <ProductList
              productos={productos}
              setProductos={setProductos}
              setSelectedProduct={setSelectedProduct}
              selectedProduct={selectedProduct}
            />
            <div className="flex flex-row justify-between  mt-1">

              <div className="flex-1">
                <h6 className="text-black font-bold m-1 fs-16px">Dirección</h6>
                <input
                  type="text"
                  value={direccionEmpresa}
                  onChange={(e) => setDireccionEmpresa(e.target.value)}
                  placeholder="Dirección de la empresa"
                  className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  required
                />
              </div>

            </div>
            <div className="flex flex-col mt-1">
              <h6 className="text-black font-bold m-1 fs-16px">Descripción de la Empresa</h6>
              <textarea
                value={descripcionEmpresa}
                onChange={(e) => setDescripcionEmpresa(e.target.value)}
                placeholder="Descripción de la empresa"
                maxLength={350}
                minLength={30}
                className="w-full p-3 bg-white text-black border_form resize-none focus:outline-none"
                rows={4}
                required
              />
            </div>

            <div className="footer-add-enterprice  mt-1">
              <div>
                <div className="flex flex-col">
                  <h6 className="text-black font-bold m-1 fs-16px">Adjuntar RUT (Registro Único Tributario)</h6>
                  <ImageInput
                    images={rutEmpresa}
                    setImages={setRutEmpresa}
                    img_lenght={1}
                    rut={true}
                  />
                </div>
                <div className="mt-6 flex flex-col">
                  <h6 className="text-black font-bold m-1 fs-16px">Logo de la empresa</h6>
                  <ImageInput images={avatarEmpresa} setImages={setAvatarEmpresa} img_lenght={1} />
                </div>
              </div>
              <div className="flex social-container">
                <h6 className="text-black font-bold mt-4 fs-16px">Redes Sociales</h6>
                <div className="flex-1">
                  <input
                    type="text"
                    value={linkEmpresa}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLinkEmpresa(value);
                      if (value && !validateField("url", value)) {
                        toast.error("Ingrese una URL válida.");
                      }
                    }}
                    placeholder="Link a la empresa"
                    className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFacebook(value);
                      if (value && !validateField("url", value)) {
                        toast.error("Ingrese una URL válida para Facebook.");
                      }
                    }}
                    placeholder="Facebook (opcional)"
                    className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInstagram(value);
                      if (value && !validateField("url", value)) {
                        toast.error("Ingrese una URL válida para Instagram.");
                      }
                    }}
                    placeholder="Instagram (opcional)"
                    className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    minLength={10}
                    inputMode="numeric"
                    placeholder="WhatsApp (opcional)"
                    className="w-full p-3 bg-white text-black border_form focus:outline-none"
                  />
                </div>

              </div>

            </div>


            <div className="w-full text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full md:w-6/12"
              >
                {isLoading ? "Cargando..." : "Crear Empresa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEnterprise;
