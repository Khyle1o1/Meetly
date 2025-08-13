import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { Users, Package, Calendar, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminStatisticsQueryFn } from "@/lib/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch admin statistics
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ["adminStatistics"],
    queryFn: getAdminStatisticsQueryFn,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage users, search, and assign admin roles",
      icon: <Users className="h-6 w-6" />,
      path: PROTECTED_ROUTES.ADMIN_USERS,
      color: "bg-blue-500",
    },
    {
      title: "Package Management",
      description: "Create and manage packages for events",
      icon: <Package className="h-6 w-6" />,
      path: PROTECTED_ROUTES.PACKAGES,
      color: "bg-green-500",
    },
    {
      title: "Event Types",
      description: "Manage event types and configurations",
      icon: <Calendar className="h-6 w-6" />,
      path: PROTECTED_ROUTES.EVENT_TYPES,
      color: "bg-purple-500",
    },
    {
      title: "Pending Bookings",
      description: "Review and manage pending bookings",
      icon: <Settings className="h-6 w-6" />,
      path: PROTECTED_ROUTES.ADMIN_PENDING_BOOKINGS,
      color: "bg-orange-500",
    },
  ];

  const statistics = statsData?.statistics || {
    totalUsers: 0,
    activeEvents: 0,
    pendingBookings: 0,
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your Meetly platform and user accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate(feature.path)}
                className="w-full"
                variant="outline"
              >
                Access
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Overview of platform activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">Loading...</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">Loading...</div>
                  <div className="text-sm text-gray-600">Active Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">Loading...</div>
                  <div className="text-sm text-gray-600">Pending Bookings</div>
                </div>
              </div>
            ) : statsError ? (
              <div className="text-center text-red-600">
                Failed to load statistics. Please try again.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.activeEvents}</div>
                  <div className="text-sm text-gray-600">Active Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statistics.pendingBookings}</div>
                  <div className="text-sm text-gray-600">Pending Bookings</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 