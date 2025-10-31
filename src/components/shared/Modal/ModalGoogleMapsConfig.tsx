import { useEffect, useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material"
import GoogleIcon from "@mui/icons-material/Google"
import { get_google_maps_config, save_google_maps_config } from "../../../api/maps"
import { toast } from "react-toastify"

interface Props {
  buttonLabel?: string
}

export default function ModalGoogleMapsConfig({ buttonLabel = "Config google maps" }: Props) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (open) {
      ;(async () => {
        try {
          const res = await get_google_maps_config()
          if (res.api_key) setApiKey(res.api_key)
        } catch {
          // ignore
        }
      })()
    }
  }, [open])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Ingresa tu API Key de Google Maps")
      return
    }
    setLoading(true)
    try {
      await save_google_maps_config(apiKey.trim())
      toast.success("API Key guardada")
      handleClose()
    } catch (e) {
      toast.error("No se pudo guardar la API Key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        fullWidth
        startIcon={<GoogleIcon fontSize="small" />}
        sx={{ bgcolor: "#1f7a3d", '&:hover': { bgcolor: '#176030' }, height: 48, textTransform: 'none', fontWeight: 600 }}
        className="flex flex-row items-center justify-center"
      >
        <span className="whitespace-nowrap text-white">{buttonLabel}</span>
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Configuración de Google Maps</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ bgcolor: "#39A900" }}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}


