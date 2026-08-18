import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RoleDashboard from "./pages/RoleDashboard";
import Unauthorized from "./pages/Unauthorized";
import { useAuth } from "./context/AuthContext";
import { dashboardPathForRole } from "./utils/roles";
import Home from "./pages/Home";
import SOSPage from "./pages/SOS";
import FakeCallPage from "./pages/FakeCall";
import LiveTrackingPage from "./pages/LiveTracking";
import SafeRoute from "./pages/SafeRoute";
import CommunityReports from "./pages/CommunityReports";
import TrustedContacts from "./components/TrustedContacts";
import AISafetyAssistant from "./components/AISafetyAssistant";
import Subscription from "./pages/Subscription";
import CheckIns from "./pages/CheckIn";
import CheckInPrompt from "./components/CheckInPrompt";
import Header from "./components/Header";
import AboutSafeHer from "./components/About";
import Service from "./components/Service";
import { Contact } from "lucide-react";
function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  return <Navigate to={isAuthenticated ? dashboardPathForRole(role) : "/login"} replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
     <CheckInPrompt />
     <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<DashboardLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard/user" element={<RoleDashboard roleName="user" />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["volunteer"]} />}>
            <Route path="/dashboard/volunteer" element={<RoleDashboard roleName="volunteer" />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["police"]} />}>
            <Route path="/dashboard/police" element={<RoleDashboard roleName="police" />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<RoleDashboard roleName="admin" />} />
          </Route>
        </Route>
        <Route path="/sos" element={<SOSPage />} />
        <Route path="/fake-call" element={<FakeCallPage />} />
        <Route path="/live-tracking/:emergencyId" element={<LiveTrackingPage />} />

        <Route path="/safe-route" element={<SafeRoute />} />
        <Route path="/reports" element={<CommunityReports userId={user?._id} />} />
        <Route element={<ProtectedRoute allowedRoles={["user", "volunteer", "police", "admin"]} />}>
          <Route path="/trusted-contacts" element={<TrustedContacts userId={user?._id} />} />
          <Route path="/ai-safety" element={<AISafetyAssistant userId={user?._id} />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["user", "volunteer", "police", "admin"]} />}>
          <Route path="/subscription" element={<Subscription />} />
        </Route>
        <Route path="/checkins" element={<CheckIns />} />
        <Route path="/about" element={<AboutSafeHer/>}/>
        <Route path="/services" element={<Service/>}/>
        <Route path="/contact" element={<Contact/>}/>
      </Routes>
    </>
  );
}
