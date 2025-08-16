import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import theme from "./theme";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import People from "./pages/People";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeFinances from "./pages/EmployeeFinances";
import EmployeeHousehold from "./pages/EmployeeHousehold";
import EmployeeEquipment from "./pages/EmployeeEquipment";
import EmployeePersonal from "./pages/EmployeePersonal";
import EmployeeAchievements from "./pages/EmployeeAchievements";
import EmployeeDocuments from "./pages/EmployeeDocuments";
import ChangePassword from "./pages/ChangePassword";
import DailySummary from "./pages/DailySummary";
import Objects from "./pages/Objects";
import ObjectDetails from "./pages/ObjectDetails";
import Materials from "./pages/Materials";
import Finances from "./pages/Finances";
import ObjectFinanceDetails from "./pages/ObjectFinanceDetails";
import Catalog from "./pages/Catalog";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import Brigades from "./pages/Brigades";
import Contractors from "./pages/Contractors";
import Settings from "./pages/Settings";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="people" element={<People />} />
                <Route path="people/:id/profile" element={<EmployeeProfile />} />
                <Route path="people/:userId/daily/:date" element={<DailySummary />} />
                <Route path="employee-finances" element={<EmployeeFinances />} />
                <Route path="household" element={<EmployeeHousehold />} />
                <Route path="equipment" element={<EmployeeEquipment />} />
                <Route path="personal" element={<EmployeePersonal />} />
                <Route path="achievements" element={<EmployeeAchievements />} />
                <Route path="employee-documents" element={<EmployeeDocuments />} />
                <Route path="objects" element={<Objects />} />
                <Route path="objects/:id" element={<ObjectDetails />} />
                <Route path="materials" element={<Materials />} />
                <Route path="finances" element={<Finances />} />
                <Route path="objects/:id/finances" element={<ObjectFinanceDetails />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:id" element={<TaskDetails />} />
                <Route path="brigades" element={<Brigades />} />
                <Route path="contractors" element={<Contractors />} />
                <Route path="settings" element={<Settings />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="documents" element={<Documents />} />
                <Route path="chat" element={<Chat />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
