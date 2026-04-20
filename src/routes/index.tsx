import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import CreditApplication from "@/pages/CreditApplication";
import RiskAssessment from "@/pages/RiskAssessment";
import Explainability from "@/pages/Explainability";
import ModelIntelligence from "@/pages/ModelIntelligence";
import Architecture from "@/pages/Architecture";
import Compliance from "@/pages/Compliance";
import AuditLog from "@/pages/AuditLog";
import NotFound from "@/pages/NotFound";

import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Documentation from "@/pages/Documentation";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/documentation" element={<Documentation />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="apply" element={<CreditApplication />} />
        <Route path="result" element={<RiskAssessment />} />
        <Route path="explainability" element={<Explainability />} />
        <Route path="model-intelligence" element={<ModelIntelligence />} />
        <Route path="performance" element={<Navigate to="/model-intelligence" replace />} />
        <Route path="model-lifecycle" element={<Navigate to="/model-intelligence" replace />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
