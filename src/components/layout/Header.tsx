"use client"

import { Disclosure, Menu, Transition } from "@headlessui/react"
import jwt_decode from "jwt-decode"
import { Fragment, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuthStore } from "../../hooks/auth"
import { useCartStore } from "../../hooks/cart"
import type { Token } from "../../Interfaces"
import ST_Icon from "../assets/ST/ST_Icon"
import AsideToggle from "../shared/tooltip/TooltipAside"
import "./../../global/style.css"
import NotificationBadge from "../NotificationBadge"
import { ShoppingCart, User, LogOut, Package, Settings } from "lucide-react"
import { Tooltip } from "@mui/material"

const Header = () => {
  const [roleLocal, setRoleLocal] = useState("")
  const cart = useCartStore((state) => state.cart)
  const { isAuth, access, id } = useAuthStore()
  const [userId, setUserId] = useState<number | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const avatar = ""

  useEffect(() => {
    const setRoleAndUserIdFromToken = () => {
      const token: string | null = access
      if (token) {
        try {
          const tokenDecoded: Token = jwt_decode(token)
          const userRole = tokenDecoded.role
          const userEnterprise = tokenDecoded.enterprise
          const userIdFromToken = tokenDecoded.user_id
          
          setRoleLocal(userRole)
          setUserId(userIdFromToken) // Establecer userId desde el token
          console.log(userEnterprise)
        } catch (error) {
          console.error("Error al decodificar el token:", error)
        }
      } else {
        setRoleLocal("")
        setUserId(null)
      }
    }

    setRoleAndUserIdFromToken()
  }, [access])

  // Usar id del store si está disponible, si no usar el del estado local (userId)
  const currentUserId = id || userId

  function logOutFun() {
    useAuthStore.getState().logout()
    navigate("/login")
  }

  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ")
  }

  useEffect(() => {
    if (!isAuth || (roleLocal !== "admin" && roleLocal !== "seller")) {
      if (location.pathname === "/admin" || location.pathname === "/addprod") {
        navigate("/")
        toast.info("No tienes permisos de acceso a esta ruta.")
      }
    }
  }, [isAuth, roleLocal, location.pathname, navigate])

  if (!isAuth && (location.pathname === "/admin" || location.pathname === "/addprod")) {
    return null
  }

  const isWideScreen = window.innerWidth > 900

  return (
    <Disclosure as="nav" className="shadow fixed top-0 w-full bg-[#2A2A2A] z-50">
      {() => (
        <>
          <div className="px-4 sm:px-6 lg:px-8 py-2 w-full">
            <div className="relative flex items-center justify-between h-14">
              {/* Left section: Logo and navigation */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  {location.pathname === "/store" && <AsideToggle />}
                  {location.pathname !== "/store" && window.innerWidth < 900 && <AsideToggle />}

                  <Link to={"/"} className="flex items-center">
                    {isWideScreen && <ST_Icon />}
                    <h1 className="titulo-while-auth font-bold text-white ml-3 text-xl">Mercampo</h1>
                  </Link>
                </div>

                {/* Desktop navigation */}
                <div className="hidden md:block ml-6">
                  <div className="flex space-x-4">
                    <Link to={"/"} className="text-white font-medium hover:text-green-500 px-3 py-2 rounded-md text-sm">
                      Inicio
                    </Link>
                    <Link
                      to={"/store"}
                      className="text-white font-medium hover:text-green-500 px-3 py-2 rounded-md text-sm"
                    >
                      Tienda
                    </Link>
                    <Link
                      to={"/enterpriseShop"}
                      className="text-white font-medium hover:text-green-500 px-3 py-2 rounded-md text-sm"
                    >
                      Emprendimientos
                    </Link>
                    <Link
                      to={"/blogs"}
                      className="text-white font-medium hover:text-green-500 px-3 py-2 rounded-md text-sm"
                    >
                      Blog
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right section: Cart, notifications, and user menu */}
              <div className="flex items-center space-x-4">
                {/* Cart con Tooltip */}
                <Tooltip 
                  title="Carrito de compras"
                  arrow
                  placement="bottom"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: '#3A3A3A',
                        color: 'white',
                        fontSize: '0.8rem',
                        '& .MuiTooltip-arrow': {
                          color: '#3A3A3A',
                        },
                      }
                    }
                  }}
                >
                  <div className="flex items-center">
                    <Link
                      to="/cart"
                      className="relative p-1 rounded-full text-white hover:text-green-500 focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate("/cart")
                      }}
                    >
                      <ShoppingCart size={20} />
                      {cart.length > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-full">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                  </div>
                </Tooltip>

                {/* Notifications con Tooltip - Solo para vendedores y administradores */}
                {isAuth && (roleLocal === "seller" || roleLocal === "admin") && (
                  <Tooltip 
                    title="Notificaciones"
                    arrow
                    placement="bottom"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: '#3A3A3A',
                          color: 'white',
                          fontSize: '0.8rem',
                          '& .MuiTooltip-arrow': {
                            color: '#3A3A3A',
                          },
                        }
                      }
                    }}
                  >
                    <div className="relative">
                      <NotificationBadge userId={id} userRole={roleLocal} />
                    </div>
                  </Tooltip>
                )}

                {/* User menu or auth buttons */}
                {isAuth ? (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Tooltip 
                      title="Menú de usuario"
                      arrow
                      placement="bottom"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: '#3A3A3A',
                            color: 'white',
                            fontSize: '0.8rem',
                            '& .MuiTooltip-arrow': {
                              color: '#3A3A3A',
                            },
                          }
                        }
                      }}
                    >
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Menú de usuario</span>
                        <img
                          className="h-8 w-8 rounded-full object-cover border-2 border-green-600"
                          src={avatar ? `${import.meta.env.VITE_BACKEND_URL}${avatar}` : "/avatar.png"}
                          alt="Avatar"
                        />
                      </Menu.Button>
                    </Tooltip>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[#2A2A2A] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? "bg-[#3A3A3A]" : "",
                                "flex items-center px-4 py-2 text-sm text-white",
                              )}
                            >
                              <User size={16} className="mr-2" />
                              Perfil
                            </Link>
                          )}
                        </Menu.Item>

                        {roleLocal === "admin" && (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/addprod"
                                  className={classNames(
                                    active ? "bg-[#3A3A3A]" : "",
                                    "flex items-center px-4 py-2 text-sm text-white",
                                  )}
                                >
                                  <Package size={16} className="mr-2" />
                                  Nuevo producto
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/admin"
                                  className={classNames(
                                    active ? "bg-[#3A3A3A]" : "",
                                    "flex items-center px-4 py-2 text-sm text-white",
                                  )}
                                >
                                  <Settings size={16} className="mr-2" />
                                  Administrar
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}

                        {roleLocal === "seller" && (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to={currentUserId ? `/myEnterprise/${currentUserId}` : '#'}
                                  className={classNames(
                                    active ? "bg-[#3A3A3A]" : "",
                                    "flex items-center px-4 py-2 text-sm text-white",
                                  )}
                                  onClick={e => {
                                    if (!currentUserId) {
                                      e.preventDefault()
                                      toast.error("No se pudo identificar tu usuario")
                                    }
                                  }}
                                >
                                  <Settings size={16} className="mr-2" />
                                  Emprender
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/addprod"
                                  className={classNames(
                                    active ? "bg-[#3A3A3A]" : "",
                                    "flex items-center px-4 py-2 text-sm text-white",
                                  )}
                                >
                                  <Package size={16} className="mr-2" />
                                  Nuevo producto
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logOutFun}
                              className={classNames(
                                active ? "bg-[#3A3A3A]" : "",
                                "flex items-center w-full text-left px-4 py-2 text-sm text-white",
                              )}
                            >
                              <LogOut size={16} className="mr-2" />
                              Cerrar sesión
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden md:flex items-center space-x-3">
                    {location.pathname !== "/login" && (
                      <Link
                        to="/login"
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
                      >
                        Iniciar sesión
                      </Link>
                    )}

                    {location.pathname !== "/register" && (
                      <Link
                        to="/register"
                        className="text-white hover:bg-green-600 hover:text-white font-medium py-2 px-4 rounded-md text-sm border border-green-600 transition-colors"
                      >
                        Registrar cuenta
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu, show/hide based on menu state */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Disclosure.Button
                as={Link}
                to="/"
                className="block text-white hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
              >
                Inicio
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/store"
                className="block text-white hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
              >
                Tienda
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/enterpriseShop"
                className="block text-white hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
              >
                Emprendimientos
              </Disclosure.Button>

              {!isAuth && (
                <>
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block text-white hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
                  >
                    Iniciar sesión
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block text-white hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
                  >
                    Registrar cuenta
                  </Disclosure.Button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Header

