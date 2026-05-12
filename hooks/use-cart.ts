import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  unit_id: string | null
  unit_name: string | null
  multiplier: number
  name: string
  price: number
  quantity: number
  image_url: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (product: any, unit?: any) => void
  removeItem: (productId: string, unitId?: string | null) => void
  updateQuantity: (productId: string, unitId: string | null | undefined, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalBaseItems: () => number
  totalPrice: () => number
  ewp: () => number // Estimated Work Period in seconds
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, unit) => {
        const currentItems = get().items
        const unitId = unit?.id || null
        const existingItem = currentItems.find((item) => item.id === product.id && item.unit_id === unitId)

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              (item.id === product.id && item.unit_id === unitId)
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: product.id,
                unit_id: unitId,
                unit_name: unit?.name || null,
                multiplier: unit?.multiplier || 1,
                name: product.name,
                price: unit?.price || product.price,
                quantity: 1,
                image_url: product.image_url,
              },
            ],
          })
        }
      },
      removeItem: (productId, unitId = null) => {
        set({
          items: get().items.filter((item) => !(item.id === productId && item.unit_id === unitId)),
        })
      },
      updateQuantity: (productId, unitId = null, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, unitId)
          return
        }
        set({
          items: get().items.map((item) =>
            (item.id === productId && item.unit_id === unitId) ? { ...item, quantity } : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalBaseItems: () => get().items.reduce((acc, item) => acc + (item.quantity * item.multiplier), 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      ewp: () => get().totalBaseItems() * 30, // EWP = Base Items * 30s
    }),
    {
      name: 'pos-cart-storage',
    }
  )
)
