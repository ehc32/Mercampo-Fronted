
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AsideFilter from "../components/tienda/AsideFilter/AsideFilter";

const HistorialDeCompras = () => {


  const DescargaRequest = (email: string, password: string) => {
    // Lógica para la solicitud de descarga
    return axios.post("/api/descargar", { email, password });
  };

  const DescargaMutation = useMutation({
    mutationFn: () => {
      return DescargaRequest("email@example.com", "password123");
    },
    onSuccess: (response: any) => {
      console.log("Descarga exitosa!", response);
      toast.success("Descarga exitosa!"); // Mensaje de éxito
    },
    onError: () => {
      toast.error("Hubo un error, intenta de nuevo");
    },
  });

  return (
    <div className="flex flex-col items-center  text-center px-4 mt-10 ">
      <div className="p-6 dark:bg-slate-300 w-11/12  rounded-lg shadow-md h-svh " style={{ boxShadow: '0px 0px 5px rgba(0, 128, 0, 0.5)', border: 'none' }}>
        <h2 className="text-xl font-semibold mb-4 text-center text-black">
          Historial de Compras
        </h2>
        <div className="mb-4 relative">

          <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-600 text-black bg-gray-100">
                  Imagen
                </th>
                <th className="py-2 px-4 border-b border-gray-600 text-black bg-gray-100">
                  Producto
                </th>
                <th className="py-2 px-4 border-b border-gray-600 text-black bg-gray-100">
                  Fecha
                </th>
                <th className="py-2 px-4 border-b border-gray-600 text-black bg-gray-100">
                  Precio
                </th>
                <th className="py-2 px-4 border-b border-gray-600 text-black bg-gray-100">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo datos de compras */}
              {[
                {
                  id: 1,
                  imagen: "../../../media/213.jpg",
                  producto: "Producto 1",
                  fecha: "2024-08-19",
                  precio: "$50.00",
                },
                {
                  id: 2,
                  imagen: "../../..//media/213.jpg",
                  producto: "Producto 2",
                  fecha: "2024-08-19",
                  precio: "$50.00",
                },
                {
                  id: 3,
                  imagen: "../../..//media/213.jpg",
                  producto: "Producto 3",
                  fecha: "2024-08-19",
                  precio: "$50.00",
                },
                {
                  id: 4,
                  imagen: "https://via.placeholder.com/50",
                  producto: "Producto 4",
                  fecha: "2024-08-15",
                  precio: "$30.00",
                },
              ].map((compra) => (
                <tr key={compra.id}>
                  <td className="py-2 px-4 border-b border-gray-600 bg-gray-50">
                    <img
                      src={compra.imagen}
                      alt={compra.producto}
                      className="w-12 h-12"
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-black bg-gray-50">
                    {compra.producto}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-black bg-gray-50">
                    {compra.fecha}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-black bg-gray-50">
                    {compra.precio}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-600 text-black bg-gray-50">
                    <button
                      onClick={() => DescargaMutation.mutate()}
                      className=" bg-[#39A900]  text-white px-4 py-2 rounded hover:bg-[#1f641b] transition-all duration-300 ease-in-out"
                    >

                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      
    </div>
  );
};

export default HistorialDeCompras;
