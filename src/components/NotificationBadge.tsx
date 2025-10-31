"use client"

import { useEffect, useState, useRef } from "react"
import { Bell, Check, CheckCheck } from "lucide-react"
import { getNotifications, markNotificationAsRead, type Notification } from "../api/notifications"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"

interface NotificationBadgeProps {
  userId: number
  userRole: string
}

const NotificationBadge = ({ userId, userRole }: NotificationBadgeProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({})
  const notificationRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  // Handle clicks outside to close notification panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userRole === "seller" || userRole === "admin") {
        try {
          setIsLoading(true)
          const data = await getNotifications()

          // Ordenar notificaciones: no leídas primero, luego por fecha (más recientes primero)
          const sortedNotifications = [...data].sort((a, b) => {
            // Primero ordenar por estado de lectura
            if (a.is_read !== b.is_read) {
              return a.is_read ? 1 : -1
            }
            // Luego ordenar por fecha (más recientes primero)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })

          // Limitar a máximo 20 notificaciones para evitar sobrecarga
          const limitedNotifications = sortedNotifications.slice(0, 20)

          setNotifications(limitedNotifications)
          setIsLoading(false)
        } catch (error) {
          console.error("Error al cargar notificaciones:", error)
          setIsLoading(false)
        }
      }
    }

    fetchNotifications()

    // Configurar un intervalo para actualizar las notificaciones cada 30 segundos
    const intervalId = setInterval(fetchNotifications, 30000)

    return () => clearInterval(intervalId)
  }, [userRole])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)

      // Actualizar el estado local inmediatamente
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    handleMarkAsRead(notification.id)

    // Navegar a la orden si existe
    if (notification.order_id) {
      // Guardar el ID de la orden para resaltarla en la página de perfil
      localStorage.setItem("highlightedOrderId", notification.order_id.toString())

      // Cambiar a la pestaña de ventas
      localStorage.setItem("profileTab", "ventas")

      // Navegar a la página de perfil
      navigate(`/profile`)
      toast.info("Navegando a la orden confirmada")
    }

    setShowNotifications(false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notification) => !notification.is_read)

      // Si no hay notificaciones sin leer, no hacer nada
      if (unreadNotifications.length === 0) {
        return
      }

      // Mostrar indicador de carga
      toast.info("Marcando todas las notificaciones como leídas...")

      // Marcar cada notificación como leída
      for (const notification of unreadNotifications) {
        await markNotificationAsRead(notification.id)
      }

      // Actualizar el estado local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, is_read: true })),
      )

      toast.success("Todas las notificaciones han sido marcadas como leídas")
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      toast.error("Error al marcar las notificaciones como leídas")
    }
  }

  // Formatear fecha para notificaciones
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Ahora mismo"
    if (diffMins < 60) return `Hace ${diffMins} minutos`
    if (diffHours < 24) return `Hace ${diffHours} horas`
    if (diffDays === 1) return "Ayer"
    return `Hace ${diffDays} días`
  }

  // Si el usuario no es vendedor o admin, no mostrar nada
  if (userRole !== "seller" && userRole !== "admin") {
    return null
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full text-white hover:text-green-500 focus:outline-none transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[92vw] rounded-xl bg-white ring-1 ring-black/5 shadow-[0_12px_32px_rgba(16,24,40,.12),_0_2px_6px_rgba(16,24,40,.06)] focus:outline-none z-50 overflow-hidden">
          <div className="py-1">
            {/* Header sticky */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-green-600 hover:text-green-800 flex items-center"
                >
                  <CheckCheck size={16} className="mr-1" />
                  Marcar todas
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                Cargando...
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden divide-y divide-gray-100">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {!notification.is_read ? (
                            <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
                          ) : (
                            <Check size={16} className="text-green-600" />
                          )}
                        </div>
                        <div className="ml-0 w-full leading-relaxed">
                          {(() => {
                            const isExpanded = !!expanded[notification.id]
                            const clampStyle = isExpanded
                              ? undefined
                              : { display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }
                            return (
                              <>
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-medium text-gray-900 break-words whitespace-normal" style={clampStyle as any}>
                                    {notification.message}
                                  </p>
                                  <span className="text-[11px] text-gray-500 flex-shrink-0">
                                    {formatNotificationDate(notification.created_at)}
                                  </span>
                                </div>
                                {notification.message && notification.message.length > 90 && (
                                  <button
                                    className="mt-1 text-xs font-semibold text-green-700 hover:text-green-800"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setExpanded((prev) => ({ ...prev, [notification.id]: !isExpanded }))
                                    }}
                                    aria-label={isExpanded ? 'Ver menos' : 'Ver más'}
                                  >
                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">No tienes notificaciones</div>
                )}
              </div>
            )}

            {/* Footer sticky */}
            {notifications.length > 0 && (
              <div className="px-0 border-t border-gray-200 sticky bottom-0 bg-white">
                <Link
                  to="/profile"
                  className="block w-full text-center text-[15px] font-semibold text-green-700 hover:text-green-800 py-3 hover:bg-gray-50"
                  onClick={() => setShowNotifications(false)}
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBadge

