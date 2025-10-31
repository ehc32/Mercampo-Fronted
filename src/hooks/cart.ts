import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "react-toastify";

interface Product {
  id: number
  name: string
  price: number
  image?: string
  quantity: number
  user: number // ID del vendedor
  user_name?: string // Nombre del vendedor
}

interface CartState {
  cart: Product[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product) => void
  removeFromCart: (product: Product) => void
  removeProduct: (product: Product) => void
  removeAll: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      totalItems: 0,
      totalPrice: 0,

      addToCart: (product: Product) => {
        const { cart } = get()
        const cartItem = cart.find((item) => item.id === product.id)

        // Verificar si ya hay productos de otro vendedor
        if (cart.length > 0 && !cartItem) {
          const firstVendorId = cart[0].user
          if (product.user !== firstVendorId) {
            // Improved toast message with better formatting and explanation
            toast.error(
              "Por el momento, solo puedes comprar productos de un mismo vendedor en cada orden. Estamos trabajando para mejorar esta experiencia pronto 😊.",
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
            return
          }
        }
       
        const price = Number(product.price) 

        if (cartItem) {
          const updatedCart = cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )

          set({
            cart: updatedCart,
            totalItems: get().totalItems + 1,
            totalPrice: parseFloat((get().totalPrice + price).toFixed(2)) 
          })
        } else {
          set({
            cart: [...cart, { ...product, quantity: 1 }],
            totalItems: get().totalItems + 1,
            totalPrice: parseFloat((get().totalPrice + price).toFixed(2)) 
          })
        }
      },

      removeFromCart: (product: Product) => {
        const { cart } = get()
        const cartItem = cart.find((item) => item.id === product.id)
        const price = Number(product.price) 

        if (cartItem) {
          if (cartItem.quantity > 1) {
            const updatedCart = cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
            )
            set({
              cart: updatedCart,
              totalItems: get().totalItems - 1,
              totalPrice: parseFloat((get().totalPrice - price).toFixed(2))
            })
          } else {
            const updatedCart = cart.filter((item) => item.id !== product.id)
            set({
              cart: updatedCart,
              totalItems: get().totalItems - 1,
              totalPrice: parseFloat((get().totalPrice - price).toFixed(2))
            })
          }
        }
      },

      removeProduct: (product: Product) => {
        const { cart } = get()
        const cartItem = cart.find((item) => item.id === product.id)

        if (cartItem) {
          const price = Number(cartItem.price) 
          const updatedCart = cart.filter((item) => item.id !== product.id)
          set({
            cart: updatedCart,
            totalItems: get().totalItems - cartItem.quantity,
            totalPrice: parseFloat((get().totalPrice - (price * cartItem.quantity)).toFixed(2))
          })
        }
      },

      removeAll: () => {
        set({
          cart: [],
          totalItems: 0,
          totalPrice: 0,
        })
      },
    }),
    {
      name: "cart-storage",
    },
  )
)