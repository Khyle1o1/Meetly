import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Shield, User, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStore } from "@/store/store";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

interface UserSearchResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Get current user state
  const { user, accessToken } = useStore();

  // Search users query
  const { 
    data: searchData, 
    refetch: refetchUsers, 
    isLoading: isSearchLoading,
    error: searchError 
  } = useQuery({
    queryKey: ["users", searchTerm, currentPage],
    queryFn: async (): Promise<UserSearchResponse> => {
      const response = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch users");
      }
      const data = await response.json();
      return data;
    },
    enabled: searchTerm.length > 0 && !!accessToken,
  });

  // Get all users query
  const { 
    data: allUsersData, 
    refetch: refetchAllUsers, 
    isLoading: isAllUsersLoading,
    error: allUsersError 
  } = useQuery({
    queryKey: ["all-users", currentPage],
    queryFn: async (): Promise<UserSearchResponse> => {
      const response = await fetch(
        `/api/admin/?page=${currentPage}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch users");
      }
      const data = await response.json();
      return data;
    },
    enabled: searchTerm.length === 0 && !!accessToken,
  });

  const data = searchTerm.length > 0 ? searchData : allUsersData;
  const isLoading = searchTerm.length > 0 ? isSearchLoading : isAllUsersLoading;
  const error = searchTerm.length > 0 ? searchError : allUsersError;

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user role");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetchUsers();
      refetchAllUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      setDeletingUserId(userId);
      const response = await fetch(`/api/admin/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetchUsers();
      refetchAllUsers();
      setDeletingUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
      setDeletingUserId(null);
    },
  });

  const handleSearch = () => {
    setCurrentPage(1);
    if (searchTerm.length > 0) {
      refetchUsers();
    } else {
      refetchAllUsers();
    }
  };

  const handleRoleToggle = (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error loading users</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Search and manage user accounts and roles
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
          <CardDescription>
            Search users by name, email, or username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
            {data && (
              <Badge variant="secondary" className="ml-2">
                {data.total} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <div className="space-y-4">
              {data.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Shield className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.email} • @{user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      disabled={updateRoleMutation.isPending}
                    >
                      {updateRoleMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        user.role === "admin" ? "Remove Admin" : "Make Admin"
                      )}
                    </Button>
                    {user.role !== "admin" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={deletingUserId === user.id || updateRoleMutation.isPending}
                      >
                        {deletingUserId === user.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm.length > 0
                ? "No users found matching your search"
                : "No users found"}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === data.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement; 