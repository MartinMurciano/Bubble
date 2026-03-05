import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Públicas
import Home from "./pages/public/Home.jsx";
import Events from "./pages/public/Events.jsx";
import EventDetail from "./pages/public/EventDetail.jsx";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import VerifyEmail from "./pages/public/VerifyEmail.jsx";
import UnlockAccount from "./pages/public/UnlockAccount.jsx";
import About from "./pages/public/About.jsx";

// Cliente
import Checkout from "./pages/client/Checkout.jsx";
import MyOrders from "./pages/client/MyOrders.jsx";
import OrderDetail from "./pages/client/OrderDetail.jsx";
import RateEvent from "./pages/client/RateEvent.jsx";

// Organizador
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard.jsx";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent.jsx";
import OrganizerEditEvent from "./pages/organizer/OrganizerEditEvent.jsx";
import OrganizerEventReport from "./pages/organizer/OrganizerEventReport.jsx";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrganizerValidation from "./pages/admin/AdminOrganizerValidation.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unlock" element={<UnlockAccount />} />
            <Route path="/about" element={<About />} />
            

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
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
