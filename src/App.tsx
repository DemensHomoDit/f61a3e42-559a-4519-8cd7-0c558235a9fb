import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Dashboard } from "@/components/Dashboard";
import { Layout } from "@/components/Layout";
import Objects from "./pages/Objects";
import Tasks from "./pages/Tasks";
import Finances from "./pages/Finances";
import ObjectFinanceDetails from "./pages/ObjectFinanceDetails";
import People from "./pages/People";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Brigades from "./pages/Brigades";
import TaskDetails from "./pages/TaskDetails";
import Materials from "./pages/Materials";
import Analytics from "./pages/Analytics";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <SidebarProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                {/* Публичный маршрут для входа */}
                <Route path="/login" element={<Login />} />
                
                {/* Защищенные маршруты */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/objects" element={
                  <ProtectedRoute>
                    <Layout>
                      <Objects />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/finances" element={
                  <ProtectedRoute>
                    <Layout>
                      <Finances />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/finances/objects/:objectId" element={
                  <ProtectedRoute>
                    <Layout>
                      <ObjectFinanceDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/people" element={
                  <ProtectedRoute>
                    <Layout>
                      <People />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/people/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/materials" element={
                  <ProtectedRoute>
                    <Layout>
                      <Materials />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/catalog" element={
                  <ProtectedRoute>
                    <Layout>
                      <Catalog />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Layout>
                      <Chat />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/documents" element={
                  <ProtectedRoute>
                    <Layout>
                      <Documents />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/brigades" element={
                  <ProtectedRoute>
                    <Layout>
                      <Brigades />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/tasks/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <TaskDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
