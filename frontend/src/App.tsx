import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import Expertise from "./pages/Expertise";
import MyBookings from "./pages/MyBookings";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import AdminConsultants from "./pages/admin/AdminConsultants";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminBudgets from "./pages/admin/AdminBudgets";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminPurchases from "./pages/admin/AdminPurchases";
import AdminBookings from "./pages/admin/AdminBookings";
import KnowledgeBasePage from "./pages/admin/KnowledgeBasePage";
import ExpertLogin from "./pages/ExpertLogin";
import ResetPassword from "./pages/ResetPassword";
import ExpertLayout from "./pages/expert/ExpertLayout";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import ExpertBookings from "./pages/expert/ExpertBookings";
import ExpertProfile from "./pages/expert/ExpertProfile";
import ExpertMarketplace from "./pages/expert/ExpertMarketplace";
import ExpertRoute from "./components/ExpertRoute";
import Flyer from "./pages/Flyer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/chat/ChatWidget";
import Phase1Flow from "./components/studio/Phase1Flow";
import BusinessProposition from "./components/studio/BusinessProposition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/expertise" element={<Expertise />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/flyer" element={<Flyer />} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <Studio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phase1"
            element={
              <ProtectedRoute>
                <Phase1Flow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/business-proposition"
            element={
              <ProtectedRoute>
                <BusinessProposition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/studio"
            element={
              <ExpertRoute>
                <Studio />
              </ExpertRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="consultants" element={<AdminConsultants />} />
            <Route path="marketplace" element={<AdminMarketplace />} />
            <Route path="studio" element={<Studio />} />
            <Route path="budgets" element={<AdminBudgets />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="purchases" element={<AdminPurchases />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          </Route>
          <Route path="/expert/login" element={<ExpertLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/expert" element={<ExpertRoute><ExpertLayout /></ExpertRoute>}>
            <Route index element={<ExpertDashboard />} />
            <Route path="bookings" element={<ExpertBookings />} />
            <Route path="profile" element={<ExpertProfile />} />
            <Route path="marketplace" element={<ExpertMarketplace />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
