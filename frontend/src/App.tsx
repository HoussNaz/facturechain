import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import EditInvoice from "./pages/EditInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";
import VerifyResult from "./pages/VerifyResult";
import NotFound from "./pages/NotFound";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <div className="main-bg min-h-screen">
      <AppShell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:hash" element={<VerifyResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </div>
  );
}

