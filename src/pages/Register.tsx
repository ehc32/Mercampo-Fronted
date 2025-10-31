import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerRequest } from "../api/users";
import { useAuthStore } from "../hooks/auth";
import {
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Box,
  Modal,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import './../global/style.css';
import ConsentModal from "../components/shared/Modal/consentForm";
import BasicTooltip from "../components/shared/tooltip/TooltipHelp";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};


const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);


  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  // Estados de los campos del formulario
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [re_password, setRePassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // Mutación para el registro de usuarios
  const registerMutation = useMutation({
    mutationFn: () =>
      registerRequest(email, name, phone, password, isSeller),
    onSuccess: () => {
      toast.success("Registro exitoso! Inicia sesión!");
      navigate("/login");
    },
    onError: () => {
      toast.error("Hubo un error, intenta nuevamente");
    },
  });

  const handleSubmit = (vender: boolean) => {

    setIsSeller(vender)

    // Validación de datos
    if (!email || !name || !phone || !password || !re_password) {
      toast.warning("Todos los campos son obligatorios");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.includes(' ')) {
      toast.warning("El correo electrónico debe ser válido y no contener espacios");
      return;
    }

    // Verificación de dominios válidos
    const validDomains = ['outlook.com', 'gmail.com', 'hotmail.com', 'soysena.edu.co', 'misena.edu.co', 'mail.com'];
    const emailDomain = email.split('@')[1];
    if (!validDomains.includes(emailDomain)) {
      toast.warning("El correo electrónico debe ser de outlook, gmail, hotmail, soysena, misena o mail");
      return;
    }

    // Verificación de coincidencia de contraseñas
    if (password !== re_password) {
      toast.warning("Las contraseñas deben coincidir");
      return;
    }

    // Validación de contraseña (mínimo 6 caracteres, al menos una letra y un número, sin espacios)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?!.*\s).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.warning("La contraseña debe tener al menos 6 caracteres, contener letras y números, y no debe incluir espacios");
      return;
    }


    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      toast.warning("El número de teléfono debe tener 10 dígitos y contener solo números");
      return;
    }

    if (!accepted) {
      toast.warning("Debe aceptar nuestros terminos y condiciones.")
      return
    }

    registerMutation.mutate();
  };

  // Manejadores para la visibilidad de las contraseñas
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  // Redirigir si ya está autenticado
  if (isAuth) return <Navigate to="/" />;

  return (
    <>
      <div className="flex flex-col justify-center items-center fondo-login min-h-screen">
        <div className="w-96 bg-slate-300 bg-opacity-20 backdrop-filter backdrop-blur-md my-2 rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:bg-opacity-20 dark:backdrop-blur-md dark:border-gray-700 flex flex-row">
          <div className="p-6 space-y-3 sm:p-8 w-full">
            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-black md:text-2xl dark:text-gray-100">
              Crear nueva cuenta
            </h1>
            <form className="space-y-3">
              <div>
                <Typography
                  variant="subtitle2"
                  component="div"
                  className="font-bold text-black dark:text-gray-200 mb-1"
                >
                  Correo electrónico
                </Typography>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="correo@email.com"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black  focus:outline-none"
                />
              </div>
              <div>
                <Typography
                  variant="subtitle2"
                  component="div"
                  className="font-bold text-black dark:text-gray-200 mb-1"
                >
                  Nombre
                </Typography>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
                  type="text"
                  placeholder="Nombre"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black  focus:outline-none"
                />
              </div>
              <div>
                <Typography
                  variant="subtitle2"
                  component="div"
                  className="font-bold text-black dark:text-gray-200 mb-1"
                >
                  Teléfono
                </Typography>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Teléfono"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black  focus:outline-none"
                  maxLength={10}
                  minLength={10}
                />
              </div>
              <div>
                <Typography
                  variant="subtitle2"
                  component="div"
                  className="font-bold text-black dark:text-gray-200 mb-1"
                >
                  Contraseña
                </Typography>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black  focus:outline-none"
                    maxLength={35}
                    minLength={10}
                  />
                  <InputAdornment
                    position="end"
                    className="absolute inset-y-6 right-0 flex items-center pr-3"
                  >
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      className="focus:outline-none"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <VisibilityOff style={{ color: "#39A900" }} />
                      ) : (
                        <Visibility style={{ color: "#39A900" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                </div>
              </div>

              <div>
                <Typography
                  variant="subtitle2"
                  component="div"
                  className="font-bold text-black dark:text-gray-200 mb-1"
                >
                  Repite la contraseña
                </Typography>
                <div className="relative">
                  <input
                    value={re_password}
                    onChange={(e) => setRePassword(e.target.value)}
                    type={showRePassword ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black  focus:outline-none"
                    maxLength={35}
                    minLength={10}
                  />
                  <InputAdornment
                    position="end"
                    className="absolute inset-y-6 right-0 flex items-center pr-3"
                  >
                    <IconButton
                      onClick={handleToggleRePasswordVisibility}
                      edge="end"
                      className="focus:outline-none"
                      aria-label="toggle repeat password visibility"
                    >
                      {showRePassword ? (
                        <VisibilityOff style={{ color: "#39A900" }} />
                      ) : (
                        <Visibility style={{ color: "#39A900" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                </div>
              </div>

              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={isSeller}
                    onChange={handleSellerChange}
                    name="isSeller"
                    style={{ color: "#39A900" }}
                  />
                }
                label={
                  <Typography style={{ color: "black", fontWeight: "bold" }}>
                    ¡Quiero vender!
                  </Typography>
                }
              /> */}
              <Button onClick={handleOpen2} className="custom-button mt-4">
                Registrarse
              </Button>
              <Typography className="tyc flex flex-row cursor-pointer" onClick={handleClickOpen}>
                Al registrarte, aceptas nuestros términos y Condiciones
              </Typography>
              <ConsentModal open={open} handleClose={handleClose} accepted={accepted} setAccepted={setAccepted} />
            </form>
          </div>
        </div>
        <Modal
          open={open2}
          onClose={handleClose2}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className="text-center">
            <Typography id="modal-modal-title" variant="h6" component="h2" >
              ¿Desea vender en nuestra plataforma?
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Al solicitar vender tendrá que esperar que un administrador apruebe su solicitud.
            </Typography>

            <Typography id="modal-modal-description" className="flex flex-row gap-1 h-12" sx={{ mt: 2 }}>

              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                fullWidth
                style={{
                  backgroundColor: "#39A900",
                  color: "white",
                }}
                className="hover:bg-lime-700 focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 btn-seller"
              >
                No, soy cliente
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(true)}
                fullWidth
                style={{
                  backgroundColor: "#39A900",
                  color: "white",
                }}
                className="hover:bg-lime-700 focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800"
              >
                Vender
              </Button>
            </Typography>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default RegisterPage;