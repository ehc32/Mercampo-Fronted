import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FaEdit } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { edit_user } from "../../../api/users";
import toast from "react-hot-toast";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 360,
  bgcolor: "#FFFFFF",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
  transition: "all 0.3s ease-in-out",
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#39A900",
    },
    "&:hover fieldset": {
      borderColor: "#39A900",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#39A900",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#39A900",
  },
};

export default function ModalEditProfile({ id }) {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [stateName, setStateName] = useState("");
  const [stateEmail, setStateEmail] = useState("");
  const [statePhone, setStatePhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [nameError, setNameError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Solo se permiten archivos PNG, JPEG o JPG.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Tamaño máximo para la imagen
        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        // Redimensionar manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión (0.8 es el nivel de calidad)
        const optimizedImage = canvas.toDataURL("image/webp", 0.8);
        
        // Guardar la imagen optimizada
        setImage(optimizedImage);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
  };

  useEffect(() => {
    console.log(id);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectedOption(null);
    setOpen(false);
    setNameError("");
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return nameRegex.test(name);
  };

  const validateEmail = (email) =>
    /^[^\s@]+@(gmail\.com|outlook\.com|hotmail\.com|soysena\.edu\.co|misena\.edu\.co)$/.test(
      email
    );
  const validatePhone = (phone) => /^\d+$/.test(phone);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setStateName(newName);
    if (newName && !validateName(newName)) {
      setNameError("El nombre solo puede contener letras y espacios");
    } else {
      setNameError("");
    }
  };

  const getSelectedOptionTitle = (option) => {
    switch (option) {
      case "nombre":
        return "Nombre";
      case "telefono":
        return "Teléfono";
      case "correo":
        return "Correo";
      case "contrasena":
        return "Contraseña";
      case "foto":
        return "Foto";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = {};
    let isValid = true;

    switch (selectedOption) {
      case "nombre":
        if (!validateName(stateName)) {
          setNameError("El nombre solo puede contener letras y espacios");
          isValid = false;
        } else {
          data = { name: stateName };
        }
        break;
      case "telefono":
        if (!validatePhone(statePhone)) {
          toast.error("El teléfono solo puede contener números positivos");
          isValid = false;
        } else {
          data = { phone: statePhone };
        }
        break;
      case "correo":
        if (!validateEmail(stateEmail)) {
          toast.error(
            "Correo electrónico no válido. Use gmail.com, outlook.com, hotmail.com, soysena.edu.co o misena.edu.co"
          );
          isValid = false;
        } else {
          data = { email: stateEmail };
        }
        break;
      case "contrasena":
        if (password === confirmPassword) {
          data = { password: password };
        } else {
          toast.error("Las contraseñas no coinciden");
          isValid = false;
        }
        break;
      case "foto":
        if (image) {
          data = { avatar: image};
        }
        break;
      default:
        toast.error("Selecciona una opción válida");
        isValid = false;
    }

    if (isValid) {
      try {
        await edit_user(data, id);
        toast.success("Datos actualizados con éxito");
        handleClose();
      } catch (error) {
        toast.error("Ha ocurrido un error al actualizar sus datos");
      }
    }
  };

  const renderContent = () => {
    switch (selectedOption) {
      case "nombre":
        return (
          <div className="mb-2">
            <InputLabel id="name-label">Nombre</InputLabel>
            <TextField
              label="Nombre"
              fullWidth
              size="small"
              value={stateName}
              onChange={handleNameChange}
              sx={inputStyle}
              error={!!nameError}
              helperText={nameError}
            />
          </div>
        );
      case "telefono":
        return (
          <div className="mb-2">
            <InputLabel id="phone-label">Teléfono</InputLabel>
            <TextField
              label="Teléfono"
              fullWidth
              size="small"
              value={statePhone}
              onChange={(e) => setStatePhone(e.target.value)}
              sx={inputStyle}
              type="number"
              inputProps={{ min: 0 }}
            />
          </div>
        );
      case "correo":
        return (
          <div className="mb-2">
            <InputLabel id="email-label">Correo</InputLabel>
            <TextField
              label="Correo"
              fullWidth
              size="small"
              value={stateEmail}
              onChange={(e) => setStateEmail(e.target.value)}
              sx={inputStyle}
            />
          </div>
        );
      case "contrasena":
        return (
          <>
            <div className="mb-2">
              <InputLabel id="password-label">Contraseña</InputLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={inputStyle}
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
              <InputLabel id="confirm-password-label">
                Confirmar Contraseña
              </InputLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                label="Confirmar Contraseña"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={inputStyle}
              />
            </div>
          </>
        );
      case "foto":
        return (
          <div className="mb-2 flex flex-col items-center">
            {image === null ? (
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-100"
              >
                <p className="text-sm text-gray-500">
                  Toca para actualizar o arrastra y suelta aquí
                </p>
                <input
                  id="dropzone-file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={image}
                  alt="Vista previa"
                  className="h-24 w-24 object-cover rounded-full mb-2"
                />
                <button
                  onClick={removeImage}
                  type="button"
                  className="mt-2 text-white bg-red-600 hover:bg-red-800 py-1 px-3 rounded"
                >
                  Eliminar Imagen
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2
        className="bg-green-700 text-white border border-green-700 hover:bg-green-800 mx-2 my-1 p-3 rounded row align-center w-56 justify-center"
        onClick={handleOpen}
      >
        <FaEdit className="fs-20px mr-1" />
        Editar
      </h2>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          {!selectedOption ? (
            <>
              <h2 id="modal-title" className="text-lg font-semibold mb-2">
                Selecciona qué quieres editar
              </h2>
              <div className="flex flex-col space-y-2">
                <button
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                  onClick={() => setSelectedOption("nombre")}
                >
                  Editar Nombre
                </button>
                <button
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                  onClick={() => setSelectedOption("telefono")}
                >
                  Editar Teléfono
                </button>
                <button
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                  onClick={() => setSelectedOption("correo")}
                >
                  Editar Correo
                </button>
                <button
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                  onClick={() => setSelectedOption("contrasena")}
                >
                  Editar Contraseña
                </button>
                <button
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                  onClick={() => setSelectedOption("foto")}
                >
                  Editar Foto
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2
                id="modal-title"
                className="text-lg font-semibold mb-2 text-center"
              >
                Editar {getSelectedOptionTitle(selectedOption)}
              </h2>
              {renderContent()}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  type="submit"
                  className="text-white bg-[#39A900] hover:bg-[#335622] rounded-lg text-sm px-4 py-2"
                >
                  Guardar 
                </button>
                <button
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 rounded-lg text-sm px-4 py-2"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </Box>
      </Modal>
    </div>
  );
}