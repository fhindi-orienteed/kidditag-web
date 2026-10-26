import { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import WebsiteLayout from "./layout/WebsiteLayout";
import LandingPage from "./pages/LandingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import AuthLayout from "./layout/AuthLayout";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import VerifyEmailPage from "./pages/auth/verify-email";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import TagsPage from "./pages/dashboard/tags";
import ChildrenPage from "./pages/dashboard/children";
import MapPage from "./pages/dashboard/map";
import ContactsPage from "./pages/dashboard/contacts";
import MedicalPage from "./pages/dashboard/medical";
import SettingsPage from "./pages/dashboard/settings";
import ActivationModal from "./components/ActivationModal";
import AdminAccountsPage from "./pages/dashboard/admin/accounts";
import AdminAccountDetailsPage from "./pages/dashboard/admin/accounts/details";
import AdminRoute from "./components/AdminRoute";
import PublicTagProfilePage from "./pages/PublicTagProfilePage";
import "@styles/pages/landing.scss";

export default function App() {
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const navigate = useNavigate();

  const handleOpenActivation = (code: string = "") => {
    setActivationCode(code || "KT-7842");
    setIsActivationOpen(true);
  };

  const handleCompleteActivation = (_data?: unknown) => {
    setIsActivationOpen(false);
    navigate("/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-root">
      <Routes>
        {/* Public Child Tag Emergency Profile (NFC / QR Scan) */}
        <Route path="/scan/:tagCode" element={<PublicTagProfilePage />} />
        <Route path="/tag/:tagCode" element={<PublicTagProfilePage />} />

        {/* Public Website Pages with Common WebsiteLayout */}
        <Route element={<WebsiteLayout onOpenActivation={handleOpenActivation} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Pages with Common AuthLayout */}
        <Route
          path="/auth"
          element={<AuthLayout onOpenActivation={handleOpenActivation} />}
        >
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Direct URL shortcuts */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        <Route
          element={<AuthLayout onOpenActivation={handleOpenActivation} />}
        >
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Parent Dashboard with Common DashboardLayout */}
        <Route
          path="/dashboard"
          element={<DashboardLayout onOpenActivation={handleOpenActivation} />}
        >
          <Route
            index
            element={<DashboardPage onOpenActivation={handleOpenActivation} />}
          />
          <Route
            path="tags"
            element={<TagsPage />}
          />
          <Route
            path="children"
            element={<ChildrenPage onOpenActivation={handleOpenActivation} />}
          />
          <Route path="map" element={<MapPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="medical" element={<MedicalPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Admin Guarded Section */}
          <Route element={<AdminRoute />}>
            <Route path="admin/accounts" element={<AdminAccountsPage />} />
            <Route path="admin/accounts/:id" element={<AdminAccountDetailsPage />} />
            {/* Future admin routes automatically inherit protection */}
            {/* <Route path="admin/logs" element={<AdminLogsPage />} /> */}
          </Route>
        </Route>

        {/* Fallback to Landing Page under WebsiteLayout */}
        <Route element={<WebsiteLayout onOpenActivation={handleOpenActivation} />}>
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>

      {/* Global Interactive Activation Modal */}
      <ActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        initialCode={activationCode}
        onCompleteActivation={handleCompleteActivation}
      />
    </div>
  );
}
