export type UserRole = 'admin' | 'barista'
export type OrderStatus = 'pending' | 'preparing' | 'completed'
export type SizeOption = 'S' | 'M' | 'L'
export type MilkType = 'full cream' | 'oat' | 'almond'
export type AddOn = 'extra shot' | 'syrup'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  created_at?: string
}

/** Public staff card for PIN login (no email). */
export interface StaffProfile {
  id: number
  name: string
  role: UserRole
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface RecipeItem {
  inventory_item_id: number
  quantity: number
}

export interface MenuItem {
  id: number
  category_id: number
  category?: Category
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  image_path: string | null
  is_available: boolean
  recipe_json: RecipeItem[]
}

export interface OrderItem {
  id?: number
  menu_item_id: number
  item_name_snapshot?: string
  quantity: number
  unit_price?: number
  line_total?: number
  size: SizeOption
  milk_type: MilkType | null
  addons: AddOn[]
}

export interface Order {
  id: number
  user_id: number
  barista?: Pick<User, 'id' | 'name' | 'role'>
  stripe_session_id?: string | null
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
  notes: string | null
  placed_at: string | null
  completed_at: string | null
  items: OrderItem[]
}

export interface InventoryLogSummary {
  change_type: string
  quantity_delta: number
  note: string | null
  created_at: string | null
}

export interface InventoryItem {
  id: number
  name: string
  unit: string
  current_stock: number
  low_stock_threshold: number
  is_low_stock: boolean
  latest_log?: InventoryLogSummary | null
}

export interface AnalyticsSummary {
  revenue: {
    daily: number
    weekly: number
    monthly: number
  }
  orders_count: {
    daily: number
    weekly: number
    monthly: number
  }
  top_selling_items: Array<{
    name: string
    quantity_sold: number
    revenue: number
  }>
  staff_leaderboard: Array<{
    id: number
    name: string
    orders_handled: number
    revenue: number
  }>
  recent_sales: Array<{
    sale_date: string
    revenue: number
    orders_count: number
  }>
}

export interface ApiResource<T> {
  data: T
}

export interface ApiCollection<T> {
  data: T[]
}

export interface CartItem extends OrderItem {
  key: string
  menuItem: MenuItem
}
