import DashboardNavbar from "@/components/DashboardNavbar";
import UploadCard from "@/components/UploadCard";
import SummaryCard from "@/components/SummaryCard";
import QuickActions from "@/components/QuickActions";
import RecentAnalysis from "@/components/RecentAnalysis";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-pink-50">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

  <h1 className="text-5xl font-bold text-gray-800">
    Good Morning, Ayushi 👋
  </h1>

  <p className="text-gray-600 mt-4 text-lg mb-10">
    Welcome back! Continue your personalized skincare journey with AI-powered insights.
  </p>

  <UploadCard />
  <SummaryCard />
  <QuickActions />
  <RecentAnalysis />

</div>
    </div>
  );
}