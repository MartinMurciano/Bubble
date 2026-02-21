import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import RateEvent from "./pages/RateEvent.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import UnlockAccount from "./pages/UnlockAccount.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard.jsx";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent.jsx";
import OrganizerEditEvent from "./pages/organizer/OrganizerEditEvent.jsx";
import OrganizerEventReport from "./pages/organizer/OrganizerEventReport.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrganizerValidation from "./pages/admin/AdminOrganizerValidation.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/unlock" element={<UnlockAccount />} />

        {/* Cliente */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/events/:id/rate" element={<ProtectedRoute><RateEvent /></ProtectedRoute>} />

        {/* Organizador */}
        <Route path="/organizer" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
        <Route path="/organizer/events/new" element={<ProtectedRoute><OrganizerCreateEvent /></ProtectedRoute>} />
        <Route path="/organizer/events/:id/edit" element={<ProtectedRoute><OrganizerEditEvent /></ProtectedRoute>} />
        <Route path="/organizer/events/:id/report" element={<ProtectedRoute><OrganizerEventReport /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/organizers" element={<ProtectedRoute><AdminOrganizerValidation /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
