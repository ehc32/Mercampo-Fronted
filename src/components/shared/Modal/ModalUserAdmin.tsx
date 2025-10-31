import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FaEdit } from "react-icons/fa";
import React, { useState } from "react";
import { edit_user } from "../../../api/users";
import toast from "react-hot-toast";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 360, // Reducido el ancho para hacer el modal más compacto
  bgcolor: "#FFFFFF",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
  transition: "all 0.3s ease-in-out",
};

export default function ModalEditProfile({ id }) {
  const [open, setOpen] = useState(false);
  const [stateName, setStateName] = useState("");
  const [stateEmail, setStateEmail] = useState("");
  const [statePhone, setStatePhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [image, setImage] = useState<any>(null);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      setImage(file); // Guardar el archivo para enviarlo
    } else {
      alert("Solo se permiten archivos PNG, JPEG o JPG.");
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
    };
    try {
      await edit_user(data, id);
      toast.success("Datos actualizados con éxito")
      handleClose();
    } catch (error) {
      toast.error("Ha ocurrido un error al actualizar sus datos")
    }
  };

  return (
    <div>
      <h2 className="bg-green-700 text-white border border-green-700 hover:bg-green-800 mx-2 my-1 p-3 rounded row align-center w-56 justify-center" onClick={handleOpen}>
        <FaEdit className="mr-2 fs-16px" />
        Editar
      </h2>

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={style}>
          <h2 id="modal-title" className="text-lg font-semibold mb-2">Editar perfil</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-2">
              <InputLabel id="name-label">Nombre</InputLabel>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                error={nameError}
                helperText={nameError ? "Por favor ingresa un nombre" : ""}
              />
            </div>
            <div className="mb-2">
              <InputLabel id="name-label">Teléfono</InputLabel>
              <TextField
                label="Teléfono"
                fullWidth
                size="small"
                value={statePhone}
                onChange={(e) => setStatePhone(e.target.value)}
                error={phoneError}
                helperText={phoneError ? "Por favor ingresa un número valido" : ""}
              />
            </div>
            <div className="mb-2">
              <InputLabel id="email-label">Correo</InputLabel>
              <TextField
                label="Correo"
                fullWidth
                size="small"
                value={stateEmail}
                onChange={(e) => setStateEmail(e.target.value)}
                error={emailError}
                helperText={emailError ? "Por favor ingresa un correo válido" : ""}
              />
            </div>

            <div className="mb-2">
              <InputLabel id="password-label">Contraseña</InputLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordError ? "Por favor ingresa tu contraseña" : ""}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </div>

            <div className="mb-2">
              <InputLabel id="confirm-password-label">Confirmar Contraseña</InputLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                label="Confirmar Contraseña"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError}
                helperText={confirmPasswordError ? "Las contraseñas no coinciden" : ""}
              />
            </div>
            <FormControl fullWidth sx={{ mb: 2 }}>
                    <Select
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#39A900',  // Borde verde cuando el Select está activo
                        }
                      }}
                    >
                      <MenuItem selected hidden>Selecciona una ubicación</MenuItem>
                      {ciudades.map((ciudad, index) => (
                        <MenuItem key={index} value={ciudad}>
                          {ciudad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
            <div className="mb-2 flex flex-col items-center">
              {image === null ? (
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-100">
                  <svg aria-hidden="true" className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1117 8h1a3 3 0 010 6h-1m-4 4v-4m0 0H9m4 0h2" />
                  </svg>
                  <p className="text-sm text-gray-500">Toca para actualizar o arrastra y suelta aquí</p>
                  <input id="dropzone-file" type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="h-24 w-24 object-cover rounded-full mb-2" />
                  <button onClick={removeImage} type="button" className="mt-2 text-white bg-red-600 hover:bg-red-800 py-1 px-3 rounded">Eliminar Imagen</button>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-2">
              <button type="submit" className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2">Guardar cambios</button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
