"use client"

import { useEffect, useState } from "react"
import { AppBar, Avatar, Box, Button, Tab, Tabs, Typography } from "@mui/material"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AccountBoxIcon from "@mui/icons-material/AccountBox"
import HandymanIcon from "@mui/icons-material/Handyman"
import PaymentIcon from "@mui/icons-material/Payment"
import { get_paypal_user } from "../../api/users"
import ModalRequestSeller from "../shared/Modal/ModalARequestSeller"
import ModalSellerConfig from "../shared/Modal/ModalConfigSeller"
import ModalEditProfile from "../shared/Modal/ModalEditUser"
import ModalMercadoPagoConfig from "../shared/Modal/ModalMercadoPagoConfig"
import ModalGoogleMapsConfig from "../shared/Modal/ModalGoogleMapsConfig"
import "./style.css"
import ConsentModal from "../shared/Modal/consentForm"
import "./../../global/style.css"
import { FaBookOpen } from "react-icons/fa"
import ModalCreateEnterprise from "../shared/Modal/ModalCreateEnterprise"
import { get_mercadopago_config } from "../../api/mercadopago"

interface ProfileTablesProps { user: any; id: any }
function ProfileTables({ user, id }: ProfileTablesProps) {
  const [tabValue, setTabValue] = useState(0)
  const [paypal, SetPaypal] = useState<any>()
  const [mercadoPago, setMercadoPago] = useState<any>()
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showAccessToken, setShowAccessToken] = useState(false)

  const [open, setOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const paypalUser = async () => {
    try {
      const response = await get_paypal_user(id)
      const data = response.data
      SetPaypal(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMercadoPagoConfig = async () => {
    try {
      const data = await get_mercadopago_config(id)
      setMercadoPago(data)
    } catch (e) {
      console.error("Error al obtener configuración de Mercado Pago:", e)
      setMercadoPago(null) // Maneja el caso de error
    }
  }

  useEffect(() => {
    paypalUser()
    fetchMercadoPagoConfig()
  }, [id])

  const handleTabChange = (_event: any, newValue: any) => {
    setTabValue(newValue)
  }

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey((prevState) => !prevState)
  }

  const toggleAccessTokenVisibility = () => {
    setShowAccessToken((prevState) => !prevState)
  }

  const isWideScreen = window.innerWidth > 900

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <AppBar position="static" color="default" elevation={0}>
        {isWideScreen ? (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ ".MuiTabs-indicator": { backgroundColor: "#39A900" } }}
          >
            <Tab
              label="Información personal"
              sx={{ "&.Mui-selected": { color: "#39A900" } }}
              className="focus:outline-none"
            />
            {user?.role !== "client" && (
              <Tab
                label="Información de PayPal"
                sx={{ "&.Mui-selected": { color: "#39A900" } }}
                className="focus:outline-none"
              />
            )}
            {user?.role !== "client" && (
              <Tab
                label="Información de Mercado Pago"
                sx={{ "&.Mui-selected": { color: "#39A900" } }}
                className="focus:outline-none"
              />
            )}
            <Tab label="Configuración" sx={{ "&.Mui-selected": { color: "#39A900" } }} className="focus:outline-none" />
          </Tabs>
        ) : (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ ".MuiTabs-indicator": { backgroundColor: "#39A900" } }}
          >
            <Tab
              icon={<AccountBoxIcon />}
              sx={{ "&.Mui-selected": { color: "#39A900" } }}
              className="focus:outline-none"
            />
            {user?.role !== "client" && (
              <Tab
                icon={<AccountBalanceIcon />}
                sx={{ "&.Mui-selected": { color: "#39A900" } }}
                className="focus:outline-none"
              />
            )}
            {user?.role !== "client" && (
              <Tab
                icon={<PaymentIcon />}
                sx={{ "&.Mui-selected": { color: "#39A900" } }}
                className="focus:outline-none"
              />
            )}
            <Tab
              icon={<HandymanIcon />}
              sx={{ "&.Mui-selected": { color: "#39A900" } }}
              className="focus:outline-none"
            />
          </Tabs>
        )}
      </AppBar>
      <TabPanel value={tabValue} index={0}>
        <div
          className="relative bg-cover bg-center h-56 md:h-64"
          style={{
            backgroundImage: `url('/public/fondopan.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end items-center pb-14">
            <div className="relative rounded-full bg-white p-2">
              <Avatar
                src={
                  user?.avatar
                    ? `${user.avatar}`
                    : "/placeholder.svg?height=100&width=100"
                }
                alt={user?.name || "User Avatar"}
                sx={{ width: 100, height: 100 }}
                className="rounded-full"
              />
            </div>
            <Typography variant="h5" className="text-white text-2xl font-bold mt-2">
              {user?.name || "Usuario"}
            </Typography>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg mt-[-50px] mx-auto max-w-3xl relative z-10">
          <Typography variant="h6" gutterBottom>
            Información personal
          </Typography>
          <Typography variant="body2" color="text-black" gutterBottom>
            En Mercampo cuidamos tu información.
          </Typography>
          <div className="flex items-center justify-between columna-info w-full">
            <div className="text-center">
              <Typography variant="h6" className="text-xl font-bold text-gray-900 w-full">
                {user?.name || "Usuario"}
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="body2" className="text-black w-full">
                {user?.phone || "Teléfono no registrado"}
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="body2" className="text-black w-full">
                {user?.email || "Correo no registrado"}
              </Typography>
            </div>
            <div className="text-center">
              <Typography
                variant="body2"
                className={`text-black ${user?.role === "admin" ? "font-bold text-green-600" : ""}`}
              >
                {user?.role === "client" ? "Cliente" : user?.role === "seller" ? "Vendedor" : "Administrador"}
              </Typography>
            </div>
          </div>
        </div>
      </TabPanel>

      {user?.role !== "client" && (
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Información de PayPal
          </Typography>
          <div className="py-4 bg-white rounded-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  Client ID:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {paypal?.client_id || "No disponible"}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  Secret Key:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {showSecretKey ? paypal?.secret_key || "No disponible" : "******"}
                </Typography>
                <Button onClick={toggleSecretKeyVisibility} style={{ color: "#39a900" }} className="focus:outline-none">
                  {showSecretKey ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  App Name:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {paypal?.app_name || "No disponible"}
                </Typography>
              </div>
            </div>
            <hr className="my-4 mb-4 border-gray-200" />
            <Typography variant="h6" gutterBottom className="mt-6">
              Pasos para configurar PayPal
            </Typography>
            <ul className="list-none space-y-4">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✔️</span>
                <Typography variant="body2" color="text-black">
                  <strong>Paso 1:</strong> Crear una cuenta en PayPal. Ve a{" "}
                  <a
                    href="https://www.paypal.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#39a900] underline"
                  >
                    PayPal
                  </a>{" "}
                  y crea una cuenta de negocios.
                </Typography>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✔️</span>
                <Typography variant="body2" color="text-black">
                  <strong>Paso 2:</strong> Ingresa a{" "}
                  <a
                    href="https://developer.paypal.com/dashboard/applications/sandbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#39a900] underline"
                  >
                    PayPal for Developers
                  </a>
                  , crea una aplicación y obtén las credenciales (Client ID y Secret Key).
                </Typography>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✔️</span>
                <Typography variant="body2" color="text-black">
                  <strong>Paso 3:</strong> Introduce el Client ID y Secret Key en el panel de configuración de PayPal en
                  tu perfil.
                </Typography>
              </li>
            </ul>
          </div>
        </TabPanel>
      )}

      {user?.role !== "client" && (
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Información de Mercado Pago
          </Typography>
          <div className="py-4 bg-white rounded-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  Public Key:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {mercadoPago?.public_key || "No disponible"}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  Access Token:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {mercadoPago?.access_token
                    ? showAccessToken
                      ? "••••••••••••••••••••••••••••••••"
                      : "••••••••••••••"
                    : "No disponible"}
                </Typography>
                {mercadoPago?.has_access_token && (
                  <Button
                    onClick={toggleAccessTokenVisibility}
                    style={{ color: "#009ee3" }}
                    className="focus:outline-none"
                  >
                    {showAccessToken ? "Ocultar" : "Mostrar"}
                  </Button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" className="text-black font-semibold">
                  Fecha de configuración:
                </Typography>
                <Typography variant="body2" className="text-gray-900">
                  {mercadoPago?.created_at ? new Date(mercadoPago.created_at).toLocaleDateString() : "No configurado"}
                </Typography>
              </div>
            </div>

            <hr className="my-4 mb-4 border-gray-200" />
          </div>
        </TabPanel>
      )}

      {user?.role !== "client" ? (
        <TabPanel value={tabValue} index={3}>
          <div className="horizontal-buttons-container">
            <ModalEditProfile id={id} />
            {user?.role === "seller" && (
              <>
                <ModalSellerConfig id={id} />
                <ModalCreateEnterprise />
                <ModalMercadoPagoConfig userId={id} />
                <ModalGoogleMapsConfig />
              </>
            )}
            {user?.role === "admin" && (
              <>
                <ModalSellerConfig id={id} />
                <ModalCreateEnterprise />
                <ModalMercadoPagoConfig userId={id} />
                <ModalGoogleMapsConfig />
              </>
            )}
            {user?.role === "client" && <ModalRequestSeller userId={id} />}
            <Typography
              className="tyc2 flex flex-row cursor-pointer bg-green-700 text-white border border-green-700 hover:bg-green-800 p-3 rounded items-center justify-center"
              onClick={handleClickOpen}
            >
              <FaBookOpen className="mr-2" />
              <span className="whitespace-nowrap">Terminos y condiciones</span>
            </Typography>
            <ConsentModal open={open} handleClose={handleClose} accepted={accepted} setAccepted={setAccepted} />
          </div>
        </TabPanel>
      ) : (
        <TabPanel value={tabValue} index={1}>
          <div className="horizontal-buttons-container">
            <ModalEditProfile id={id} />
            {user?.role === "seller" && (
              <>
                <ModalSellerConfig id={id} />
              </>
            )}
            {user?.role === "admin" && (
              <>
                <ModalSellerConfig id={id} />
                <ModalCreateEnterprise />
                <ModalMercadoPagoConfig userId={id} />
              </>
            )}
            {user?.role === "client" && <ModalRequestSeller userId={id} />}
            <Typography
              className="tyc2 flex flex-row cursor-pointer bg-green-700 text-white border border-green-700 hover:bg-green-800 p-3 rounded items-center justify-center"
              onClick={handleClickOpen}
            >
              <FaBookOpen className="mr-2" />
              <span className="whitespace-nowrap">Terminos y condiciones</span>
            </Typography>
            <ConsentModal open={open} handleClose={handleClose} accepted={accepted} setAccepted={setAccepted} />
          </div>
        </TabPanel>
      )}
    </Box>
  )
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default ProfileTables

  