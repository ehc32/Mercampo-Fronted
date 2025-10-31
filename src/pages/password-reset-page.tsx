"use client"

import { useMutation } from "@tanstack/react-query"
import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Button, Typography, CircularProgress } from "@mui/material"

// Función para hacer la solicitud de restablecimiento de contraseña
const requestPasswordReset = async (email: string) => {
  const response = await fetch("http://localhost:8000/users/password-reset/request/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error("Error al solicitar restablecimiento de contraseña")
  }

  return response.json()
}

const PasswordResetPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState("")

  const resetMutation = useMutation({
    mutationFn: () => requestPasswordReset(email),
    onSuccess: () => {
      toast.success("Se ha enviado un código de recuperación a tu correo electrónico")
      // Redirigir a la página de verificación con el email como parámetro
      navigate(`/password-reset-verify?email=${encodeURIComponent(email)}`)
    },
    onError: () => {
      toast.error("Hubo un error, verifica tu correo e intenta de nuevo")
    },
  })

  const validateForm = () => {
    if (!email) {
      setFormError("El correo electrónico es requerido")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("El correo electrónico no es válido")
      return false
    }
    setFormError("")
    return true
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
            Recuperar Contraseña
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
                required
              />
              {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
            </div>

            <div className="text-sm text-black dark:text-gray-300">
              Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
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
                  <span>Enviando...</span>
                </div>
              ) : (
                "Enviar Código"
              )}
            </Button>

            <p className="text-sm font-light text-black dark:text-gray-300">
              ¿Recordaste tu contraseña?{" "}
              <Link to={"/login"} className="font-medium text-white hover:underline dark:text-lime-400">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetPage

