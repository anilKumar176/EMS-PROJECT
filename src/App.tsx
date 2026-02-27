import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignupUser from "./pages/SignupUser";
import SignupVendor from "./pages/SignupVendor";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorItems from "./pages/vendor/VendorItems";
import VendorAddItem from "./pages/vendor/VendorAddItem";
import VendorTransactions from "./pages/vendor/VendorTransactions";
import UserDashboard from "./pages/user/UserDashboard";
import UserVendors from "./pages/user/UserVendors";
import UserCart from "./pages/user/UserCart";
import UserGuestList from "./pages/user/UserGuestList";
import UserOrders from "./pages/user/UserOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (user && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "vendor") return <Navigate to="/vendor" replace />;
    if (role === "user") return <Navigate to="/user" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<AuthRedirect><Index /></AuthRedirect>} />
    <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
    <Route path="/signup/user" element={<AuthRedirect><SignupUser /></AuthRedirect>} />
    <Route path="/signup/vendor" element={<AuthRedirect><SignupVendor /></AuthRedirect>} />

    <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

    <Route path="/vendor" element={<ProtectedRoute allowedRole="vendor"><VendorDashboard /></ProtectedRoute>} />
    <Route path="/vendor/items" element={<ProtectedRoute allowedRole="vendor"><VendorItems /></ProtectedRoute>} />
    <Route path="/vendor/items/new" element={<ProtectedRoute allowedRole="vendor"><VendorAddItem /></ProtectedRoute>} />
    <Route path="/vendor/transactions" element={<ProtectedRoute allowedRole="vendor"><VendorTransactions /></ProtectedRoute>} />

    <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
    <Route path="/user/vendors" element={<ProtectedRoute allowedRole="user"><UserVendors /></ProtectedRoute>} />
    <Route path="/user/cart" element={<ProtectedRoute allowedRole="user"><UserCart /></ProtectedRoute>} />
    <Route path="/user/guests" element={<ProtectedRoute allowedRole="user"><UserGuestList /></ProtectedRoute>} />
    <Route path="/user/orders" element={<ProtectedRoute allowedRole="user"><UserOrders /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
