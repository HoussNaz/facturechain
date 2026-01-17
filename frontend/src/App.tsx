import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Verify from "./pages/Verify";
import VerifyResult from "./pages/VerifyResult";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <div className="main-bg min-h-screen">
      <AppShell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:hash" element={<VerifyResult />} />
        </Routes>
      </AppShell>
    </div>
  );
}
