import { useState } from "react";
import SubscriptionNavbar from "../subscription/dashboard-navbar";
import { SubscriberSidebar } from "../subscription/sidebar";
// import { BillingPage } from "../subscription/BillingDetails";
// import { CoursesPage } from "../subscription/CoursePage";
import { Menu } from "lucide-react";
import { Dashboard } from "../subscription/dashboard";
import { CoursesPage } from "../subscription/courses";
import { BillingPage } from "../subscription/billing-details";
// import { Dashboard } from "../subscription/Dashbaord";
// import DashboardSection from "../subscription/Dashbaord";

export default function SubscriberDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar — full width */}
      <SubscriptionNavbar />

      {/* Below navbar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SubscriberSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Platform</h1>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* {activeSection === "dashboard" && <DashboardSection />} */}
              {activeSection === "dashboard" && <Dashboard />}
              {activeSection === "courses" && <CoursesPage />}
              {activeSection === "billing" && <BillingPage />}
              {/* {activeSection === "profile" && <ProfileSection />} */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
