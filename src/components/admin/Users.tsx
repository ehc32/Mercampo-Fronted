import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FormControl, MenuItem, IconButton as MUIIconButton, Select } from '@mui/material';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Modal from "@mui/material/Modal";
import Pagination from '@mui/material/Pagination';
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { changePermission, delete_user, edit_user, get_users } from "../../api/users";
import ModalMercadoPagoConfig from "../shared/Modal/ModalMercadoPagoConfig";

// Styles for Modal
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 360, // Reduced width for a more compact modal
  bgcolor: "#FFFFFF",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
  transition: "all 0.3s ease-in-out",
};

const Users = ({ results }: any) => {
  const [idLocal, setIdLocal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [dataLenght, setDataLenght] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false); // Added state for confirmation modal
  const [stateName, setStateName] = useState("");
  const [stateEmail, setStateEmail] = useState("");
  const [statePhone, setStatePhone] = useState("");
  const [roleNew, setRoleNew] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [image, setImage] = useState<any>(null);

  // Confirmation modal handling
  const [userToDelete, setUserToDelete] = useState<number | null>(null); // ID of the user to delete

  const handleModalOpen = (user: any) => {
    setIdLocal(user.id);
    setStateName(user.name);
    setStateEmail(user.email);
    setStatePhone(user.phone);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setImage(null);
  };

  const handleOpenConfirmationModal = (id: number) => {
    setUserToDelete(id);
    setConfirmationModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModalOpen(false);
    setUserToDelete(null);
  };

  const handleChangePublicsPermision = async (id: number) => {
    try {
      await changePermission(id);
      toast.success("El permiso del usuario ha cambiado");
      fetchUsers();
    } catch (error) {
      toast.warning("El usuario no es vendedor ni administrador");
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setNameError(!stateName);
    setEmailError(!stateEmail);
    setPhoneError(!statePhone);
    setPasswordError(!password);
    setConfirmPasswordError(password !== confirmPassword);

    if (stateName && stateEmail && statePhone && password && password === confirmPassword) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const data = {
      name: stateName,
      email: stateEmail,
      phone: statePhone,
      password: password,
      image: image,
      role: roleNew,
    };
    try {
      await edit_user(data, idLocal);
      toast.success("Datos actualizados correctamente");
      handleModalClose();
    } catch (error) {
      toast.warning("Ocurrió un error al actualizar los datos");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await delete_user(id);
      toast.success("Usuario eliminado correctamente");
      fetchUsers();
    } catch (e) {
      toast.error("No se pudo eliminar este usuario");
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      handleDelete(userToDelete);
      handleCloseConfirmationModal();
    }
  };

  const fetchUsers = async () => {
    const response = await get_users();
    setData(response);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const formatDate = (fechaISO: any) => {
    const fecha = new Date(fechaISO);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const year = fecha.getFullYear();
    return `${dia} de ${mes} del ${year}`;
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold my-3 text-center text-black">
        Lista de usuarios
      </h2>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-2 py-1 text-center">Nombre</th>
            <th scope="col" className="px-2 py-1 text-center">Correo</th>
            <th scope="col" className="px-2 py-1 text-center">Teléfono</th>
            <th scope="col" className="px-2 py-1 text-center">Rol</th>
            <th scope="col" className="px-2 py-1 text-center">Publicar</th>
            <th scope="col" className="px-2 py-1 text-center">Fecha de registro</th>
            <th scope="col" className="px-2 py-1 text-center">Opciones</th>
          </tr>
        </thead>
        {data && data.length > 0 ? (
          <tbody>
            {data.map((o: any) => (
              <tr key={o.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:dark:hover:bg-gray-600">
                <td className="px-2 py-1 ">{o.name}</td>
                <td className="px-2 py-1 ">{o.email}</td>
                <td className="px-2 py-1 ">{o.phone}</td>
                <td className="px-2 py-1 text-center">{o.role === "seller" ? "Vendedor" : o.role == "admin" ? "Administrador" : "Cliente"}</td>
                <td className="px-2 py-1 text-center">{o.can_publish ? "Puede" : "No puede"}</td>
                <td className="px-2 py-1 text-center">{formatDate(o.date_joined)}</td>
                <td className="px-2 py-1 text-center whitespace-nowrap">
                  {
                    !o.can_publish ? (
                      <MUIIconButton className="focus:outline-none" onClick={() => handleChangePublicsPermision(o.id)}>
                        <PublicOffIcon className="text-yellow-600" />
                      </MUIIconButton>
                    ) : (
                      <MUIIconButton className="focus:outline-none" onClick={() => handleChangePublicsPermision(o.id)}>
                        <PublicIcon className="text-green-600" />
                      </MUIIconButton>
                    )
                  }
                  <MUIIconButton className="focus:outline-none" onClick={() => handleModalOpen(o)}>
                    <DriveFileRenameOutlineIcon className="text-blue-600" />
                  </MUIIconButton>
                  {(o.role === "seller" || o.role === "admin") && (
                    <div style={{ display: "inline-block", marginLeft: "8px" }}>
                      <ModalMercadoPagoConfig userId={o.id} />
                    </div>
                  )}
                  <MUIIconButton className="focus:outline-none" onClick={() => handleOpenConfirmationModal(o.id)}>
                    <DeleteIcon className="text-red-600" />
                  </MUIIconButton>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={7} className="px-6 py-1 text-center">No hay usuarios registrados</td>
            </tr>
          </tbody>
        )}
      </table>

      {/* Pagination */}
      <Box className="flex justify-center my-3">
      <Pagination
          count={Math.ceil(dataLenght / 10)}
          page={page}
          onChange={(event, value) => setPage(value)}
          className="flex flex-row w-full justify-center my-6"
        />
      </Box>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <h2 className="text-lg font-semibold mb-2">Editar Usuario</h2>
          <form onSubmit={handleFormSubmit}>
            <TextField
              label="Nombre"
              fullWidth
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              error={nameError}
              helperText={nameError ? "Este campo es obligatorio" : ""}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Correo"
              fullWidth
              value={stateEmail}
              onChange={(e) => setStateEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? "Este campo es obligatorio" : ""}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Teléfono"
              fullWidth
              value={statePhone}
              onChange={(e) => setStatePhone(e.target.value)}
              error={phoneError}
              helperText={phoneError ? "Este campo es obligatorio" : ""}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={roleNew}
                onChange={(e) => setRoleNew(e.target.value)}
              >
                <MenuItem value="client">Cliente</MenuItem>
                <MenuItem value="seller">Vendedor</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordError ? "La contraseña es obligatoria" : ""}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              helperText={confirmPasswordError ? "Las contraseñas no coinciden" : ""}
              sx={{ mb: 2 }}
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-20 right-4"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#39A900] rounded"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-white bg-red-600 rounded ml-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        open={confirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <Box sx={style}>
          <h2 className="text-lg font-semibold mb-2">Confirmación de Eliminación</h2>
          <p>¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-white bg-red-600 rounded"
            >
              Eliminar
            </button>
            <button
              onClick={handleCloseConfirmationModal}
              className="px-4 py-2 text-white bg-gray-600 rounded ml-2"
            >
              Cancelar
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Users;
