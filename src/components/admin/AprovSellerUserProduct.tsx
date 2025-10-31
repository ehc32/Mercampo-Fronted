import Pagination from '@mui/material/Pagination';
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { approveRequestSeller, bring_new_products, delete_product } from "../../api/products";
import { get_solo_user } from "../../api/users";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';


const AprovSellerUser = ({ results }: Props) => {
  const [page, setPage] = useState(1);
  const [dataLenght, setDataLenght] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [idOption, setIdOption] = useState<number | null>(null);
  const [dataUser, setDataUser] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const handleOpen = (id: number) => {
    setIdOption(id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleCloseModal = () => setModalOpen(false);


  const fetchProductos = async () => {
    try {
      const response = await bring_new_products(page);
      const data = response.data;
      setData(data);
      setDataLenght(data.length);
    } catch (error) {
      toast.error('Error al obtener usuarios');
    }
  };


  const confirmarEliminar = async () => {
    if (idOption !== null) {
      try {
        await delete_product(idOption);
        toast.success('Producto eliminado con éxito!');
        queryClient.invalidateQueries(["products"]);
        fetchProductos();
      } catch (e: any) {
        toast.error('Error al eliminar el producto');
      } finally {
        setOpen(false); // Cierra el modal después de confirmar
      }
    }
  };


  useEffect(() => {
    fetchProductos();
  }, [page]);

  const acceptUser = async (idUser: number, name: string) => {
    try {
      await approveRequestSeller(idUser);
      toast.dismiss();
      toast.success(`El producto ${name} ha sido aceptado`);
      fetchProductos();
    } catch (e) {
      toast.dismiss();
      toast.warning(`Ha ocurrido un problema al aceptar el producto ${name}`);
    }
  };

  const handleOpenModal = async (user: any) => {
    try {
      const response = await get_solo_user(user);
      setDataUser(response);
      toast.success('Usuario cargado con éxito');
    } catch (e) {
      toast.error('Error al cargar al usuario');
    }
    setModalOpen(true);
  };

  const rejectUser = async (idUser: number, name: string) => {
    try {
      await delete_product(idUser);
      toast.dismiss();
      toast.error(`El producto ${name} ha sido rechazado`);
      fetchProductos();
    } catch (e) {
      toast.dismiss();
      toast.warning(`Ha ocurrido un problema al rechazar el producto ${name}`);
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
            <th scope="col" className="px-2 py-2 text-center">Categoria</th>
            <th scope="col" className="px-2 py-2 text-center">Localización</th>
            <th scope="col" className="px-2 py-2 text-center">Precio</th>
            <th scope="col" className="px-2 py-2 text-center">Unidad</th>
            <th scope="col" className="px-2 py-2 text-center">Opiniones</th>
            <th scope="col" className="px-2 py-2 text-center">Calificación</th>
            <th scope="col" className="px-2 py-2 text-center">Fecha de creación</th>
            <th scope="col" className="px-2 py-2 text-center">Publicado</th>
          </tr>
        </thead>
        {data && data.length > 0 ? (
          <tbody>
            {data.map((o: any) => (
              <tr key={o.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600">
                <td className="px-2 py-2 whitespace-nowrap">{o.name}</td>
                <td className="px-2 py-2 whitespace-nowrap">{o.category}</td>
                <td className="px-2 py-2 whitespace-nowrap">{o.map_locate.slice(0, 20)}</td>
                <td className="px-2 py-2 whitespace-nowrap">$ {Number(o.price).toLocaleString()}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.unit}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.num_reviews}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap">{o.rating ? o.rating : "Sin comentarios"}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatearFecha(o.created)}</td>
                <td className="px-2 py-2 text-center whitespace-nowrap justify-center gap align-center">
                  <IconButton className='focus:outline-none' onClick={() => handleOpenModal(o.user)}>
                    <VisibilityIcon className='text-[#39A900]' />
                  </IconButton>
                  <div onClick={() => acceptUser(o.id, o.name)}>
                    <CheckIcon className='text-green-500 mx-1 cursor-pointer' />
                  </div>
                  <div onClick={() => rejectUser(o.id, o.name)}>
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
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ width: 500, maxHeight: 700, padding: 2, backgroundColor: 'background.paper', margin: 'auto', marginTop: '10%' }}>
          {dataUser ? (
            <div className="text-center">
              <img src={"./../../public/avatar.png"} alt="avatar" className="w-24 h-24 rounded-full mx-auto" />
              <h2 className="text-xl font-bold mt-4">{dataUser.name}</h2>
              <p className="text-gray-600">{dataUser.email}</p>
              <p className="text-gray-600">{dataUser.phone}</p>
            </div>
          ) : (
            <p>No hay información disponible</p>
          )}
          <div className='w-full text-center'>
            <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-[#39A900] text-white rounded w-6/12">Cerrar</button>
          </div>
        </Box>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ width: 400, padding: 2, backgroundColor: 'background.paper', margin: 'auto', marginTop: '20%' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            ¿Realmente desea eliminar este producto?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={confirmarEliminar} // Lógica para confirmar
              sx={{ marginRight: 1 }}
            >
              Confirmar
            </Button>
            <Button
              variant="contained"
              onClick={handleClose} // Cerrar modal
              sx={{
                marginLeft: 1,
                backgroundColor: '#808080', // Color gris medio
                color: 'white', // Color de texto blanco
                '&:hover': {
                  backgroundColor: '#454545' // Color gris oscuro en hover
                }
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
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
