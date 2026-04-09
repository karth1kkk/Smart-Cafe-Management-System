import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage'
import { CheckoutCancelPage } from './pages/CheckoutCancelPage'
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage'
import { InventoryDashboardPage } from './pages/InventoryDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MenuManagementPage } from './pages/MenuManagementPage'
import { OrdersQueuePage } from './pages/OrdersQueuePage'
import { PosDashboardPage } from './pages/PosDashboardPage'

function App() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<PosDashboardPage />} />
          <Route path="/orders" element={<OrdersQueuePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AppShell />}>
          <Route path="/menu" element={<MenuManagementPage />} />
          <Route path="/inventory" element={<InventoryDashboardPage />} />
          <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
