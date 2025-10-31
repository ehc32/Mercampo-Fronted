"use client"

import { useMutation } from "@tanstack/react-query"
import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { IconButton, InputAdornment, Button, Typography, CircularProgress } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"

// Función para verificar el código y establecer la nueva contraseña
const verifyResetCode = async (email: string, code: string, newPassword: string) => {
  const response = await fetch("http://localhost:8000/users/password-reset/verify/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
      new_password: newPassword,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al verificar el código")
  }

  return response.json()
}

const PasswordResetVerifyPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Extraer email de los parámetros de la URL
  const queryParams = new URLSearchParams(location.search)
  const emailParam = queryParams.get("email") || ""

  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  })

  // Si no hay email en los parámetros, redirigir a la página de solicitud
  useEffect(() => {
    if (!emailParam) {
      toast.error("Por favor, primero solicita un código de recuperación")
      navigate("/password-reset")
    }
  }, [emailParam, navigate])

  const resetMutation = useMutation({
    mutationFn: () => verifyResetCode(email, code, newPassword),
    onSuccess: () => {
      toast.success("¡Contraseña actualizada con éxito!")
      navigate("/login")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Hubo un error, intenta de nuevo")
    },
  })

  const validateForm = () => {
    const errors = {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    }
    let isValid = true

    if (!email) {
      errors.email = "El correo electrónico es requerido"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "El correo electrónico no es válido"
      isValid = false
    }

    if (!code) {
      errors.code = "El código de verificación es requerido"
      isValid = false
    }

    if (!newPassword) {
      errors.password = "La nueva contraseña es requerida"
      isValid = false
    } else if (newPassword.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres"
      isValid = false
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (validateForm()) {
      resetMutation.mutate()
    }
  }

  return (
    <div className="flex flex-col justify-center items-center fondo-login min-h-screen">
      <div className="w-96 bg-slate-300 bg-opacity-20 backdrop-filter backdrop-blur-md rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:bg-opacity-20 dark:backdrop-blur-md flex flex-row">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-full">
          <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-black md:text-2xl dark:text-gray-100">
            Verificar Código
          </h1>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <Typography variant="subtitle1" component="div" className="font-bold text-black mb-1">
                Correo electrónico
              </Typography>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="correo@email.com"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none"
                disabled // El email viene como parámetro y no debería cambiarse
                required
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <Typography variant="subtitle1" component="div" className="font-bold text-black mb-1">
                Código de verificación
              </Typography>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type="text"
                placeholder="Ingresa el código recibido"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none"
                required
              />
              {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
            </div>

            <div>
              <Typography variant="subtitle1" component="div" className="font-bold text-black mb-1">
                Nueva contraseña
              </Typography>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none"
                  required
                />
                <InputAdornment position="end" className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <IconButton onClick={handleTogglePasswordVisibility} edge="end" className="focus:outline-none">
                    {showPassword ? (
                      <VisibilityOff style={{ color: "#39A900" }} />
                    ) : (
                      <Visibility style={{ color: "#39A900" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              </div>
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>

            <div>
              <Typography variant="subtitle1" component="div" className="font-bold text-black mb-1">
                Confirmar contraseña
              </Typography>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none"
                  required
                />
                <InputAdornment position="end" className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end" className="focus:outline-none">
                    {showConfirmPassword ? (
                      <VisibilityOff style={{ color: "#39A900" }} />
                    ) : (
                      <Visibility style={{ color: "#39A900" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              </div>
              {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={resetMutation.isLoading}
              style={{
                backgroundColor: "#39A900",
                color: "white",
              }}
              className="hover:bg-lime-700 focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800"
            >
              {resetMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <CircularProgress size={24} color="inherit" className="mr-2" />
                  <span>Procesando...</span>
                </div>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>

            <p className="text-sm font-light text-black dark:text-gray-300">
              ¿No recibiste el código?{" "}
              <Link to={"/password-reset"} className="font-medium text-white hover:underline dark:text-lime-400">
                Solicitar de nuevo
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetVerifyPage

