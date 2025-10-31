import Pagination from '@mui/material/Pagination';
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { approveRequestSeller, bringRequestSeller, deleteRequestSeller } from "../../api/users";

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';


const AprovSellerUser = ({ results }: Props) => {
  const [page, setPage] = React.useState(1);
  const [dataLenght, setDataLenght] = useState(0);
  const [data, setData] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await bringRequestSeller();
      const data = response.data;
      setData(data);
      setDataLenght(data.length);
    } catch (error) {
      toast.error('Error al obtener usuarios');
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [page]);

  const acceptUser = async (idUser: number, name: string) => {
    try {
      await approveRequestSeller(idUser);
      toast.dismiss();
      toast.success(`El usuario ${name} ha sido aceptado`);
      fetchUsers();
    } catch (e) {
      toast.dismiss();
      toast.warning(`Ha ocurrido un problema al aceptar el usuario ${name}`);
    }
  };

  const rejectUser = async (idUser: number, name: string) => {
    try {
      await deleteRequestSeller(idUser);
      toast.dismiss();
      toast.error(`El usuario ${name} ha sido rechazado`);
      fetchUsers();
    } catch (e) {
      toast.dismiss();
      toast.warning(`Ha ocurrido un problema al rechazar el usuario ${name}`);
    }
  };

  function formatearFecha(fechaISO: any) {
    const fecha = new Date(fechaISO);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const year = fecha.getFullYear();

    return `${dia} de ${mes} del ${year}`;
  }


  return (
    <div className="overflow-x-auto scroll-tablas">
      <h2 className="text-xl font-semibold  my-3 text-center text-black ">
        Aprobación o denegación de solicitudes para vender
      </h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-2 py-2 text-center">Nombre</th>
            <th scope="col" className="px-2 py-2 text-center">Correo</th>
            <th scope="col" className="px-2 py-2 text-center">Descripción</th>
            <th scope="col" className="px-2 py-2 text-center">Fecha de solicitud</th>
            <th scope="col" className="px-2 py-2 text-center">Opciones</th>
          </tr>
        </thead>
        {data && data.length > 0 ? (
          <tbody>
            {data.map((o: any, index: number) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600">
                <td className="px-2 py-2 whitespace-nowrap">{o.user.name}</td>
                <td className="px-2 py-2 whitespace-nowrap">{o.user.email}</td>
                <td className="px-2 py-2 text-center">{o.user.phone == null ? "Sin definido" : o.user.phone}</td>
                <td className="px-2 py-2 whitespace-nowrap text-center">{formatearFecha(o.date_requested)}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap justify-center gap align-center">
                  <div onClick={() => acceptUser(o.user.id, o.user.name)}>
                    <CheckIcon className='text-green-500 mx-1 cursor-pointer' />
                  </div>
                  <div onClick={() => rejectUser(o.user.id, o.user.name)}>
                    <CloseIcon className='text-red-500 mx-1 cursor-pointer' />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={7} className="px-2 py-2 text-center">No se encontraron solicitudes</td>
            </tr>
          </tbody>
        )}
      </table>

      <div>
        <Pagination
          count={Math.ceil(dataLenght / 10)}
          page={page}
          onChange={(event, value) => setPage(value)}
          className="flex flex-row w-full justify-center my-6"
        />
      </div>
    </div>
  );

};

export default AprovSellerUser;
