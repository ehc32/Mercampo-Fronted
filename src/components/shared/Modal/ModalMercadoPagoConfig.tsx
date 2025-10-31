"use client"

import { useState } from "react"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaRegBuilding } from "react-icons/fa"
import { save_mercadopago_config } from "../../../api/mercadopago"

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#FFFFFF",
  border: "none",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
}

interface ModalMercadoPagoConfigProps {
  userId: number
}

export default function ModalMercadoPagoConfig({ userId }: ModalMercadoPagoConfigProps) {
  const [openModal, setOpenModal] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOpen = () => setOpenModal(true)
  const handleClose = () => setOpenModal(false)

  const handleToggleAccessTokenVisibility = () => {
    setShowAccessToken(!showAccessToken)
  }

  const handleConfirm = async () => {
    if (await sendRequest()) {
      setOpenModal(false)
    }
  }

  const sendRequest = async () => {
    // Validación básica
    if (!publicKey.trim()) {
      toast.error("El Public Key es obligatorio")
      return false
    }

    if (!accessToken.trim()) {
      toast.error("El Access Token es obligatorio")
      return false
    }

    setLoading(true)

    try {
      // Enviar los datos como un objeto estructurado, no como FormData
      const result = await save_mercadopago_config({
        user_id: userId,
        public_key: publicKey,
        access_token: accessToken,
      })

      if (result.success) {
        toast.success("Configuración de Mercado Pago completada")
        return true
      } else {
        toast.error(result.message || "No se ha podido configurar la información de pago")
        return false
      }
    } catch (e: any) {
      console.error("Error al guardar configuración:", e)
      toast.error(e.message || "No se ha podido configurar la información de pago")
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2
        className="bg-green-700 text-white border border-green-700 hover:bg-green-800 mx-1 my-1 p-2 rounded row align-center justify-center cursor-pointer"
        onClick={handleOpen}
      >
        <FaRegBuilding className="mr-1" />
        Config. Mercado Pago
      </h2>

      <Modal
        open={openModal}
        onClose={handleClose}
        className="border-none focus:outline-none"
        aria-labelledby="request-seller-modal-title"
        aria-describedby="request-seller-modal-description"
      >
        <Box sx={style}>
          <p
            style={{
              marginBottom: "20px",
              fontSize: "22px",
              textAlign: "center",
              fontWeight: "bold",
              color: "#020302",
            }}
          >
            Configuración de Mercado Pago
          </p>

          <TextField
            fullWidth
            label="Public Key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            margin="normal"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "##1f211e" },
                "&:hover fieldset": { borderColor: "#1f211e" },
                "&.Mui-focused fieldset": { borderColor: "#1f211e" },
              },
              "& .MuiInputLabel-root": { color: "#1f211e" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#39A900" },
              "& .MuiInputBase-input": { color: "#444444" },
            }}
          />

          <TextField
            fullWidth
            label="Access Token"
            type={showAccessToken ? "text" : "password"}
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            margin="normal"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "##1f211e" },
                "&:hover fieldset": { borderColor: "#1f211e" },
                "&.Mui-focused fieldset": { borderColor: "#1f211e" },
              },
              "& .MuiInputLabel-root": { color: "#1f211e" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#39A900" },
              "& .MuiInputBase-input": { color: "#444444" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleAccessTokenVisibility} edge="end" disabled={loading}>
                    {showAccessToken ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <div className="flex flex-row gap-5" style={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AiOutlineCheck />}
              onClick={handleConfirm}
              disabled={loading}
              sx={{
                backgroundColor: "#39A900",
                "&:hover": {
                  backgroundColor: "#2C7A00",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                  color: "#666666",
                },
              }}
            >
              {loading ? "Guardando..." : "Confirmar"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClose}
              startIcon={<AiOutlineClose />}
              disabled={loading}
              sx={{
                color: "#39A900",
                borderColor: "#39A900",
                "&:hover": {
                  borderColor: "#2C7A00",
                  color: "#2C7A00",
                },
                "&:disabled": {
                  borderColor: "#cccccc",
                  color: "#666666",
                },
              }}
            >
              Cancelar
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

