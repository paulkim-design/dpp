import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { DevToolbar } from "@/components/dev-toolbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardPage } from "@/pages/dashboard"
import { ListViewPage } from "@/pages/list-view"
import { ProductDetailsPage } from "@/pages/product-details"
import { AppStoreProvider } from "@/store/app-store"

export default function App() {
  return (
    <AppStoreProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sets/ss27-m-urban-jungle" element={<ListViewPage />} />
            <Route path="/products/:styleNumber" element={<ProductDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <DevToolbar />
        </BrowserRouter>
      </TooltipProvider>
    </AppStoreProvider>
  )
}
