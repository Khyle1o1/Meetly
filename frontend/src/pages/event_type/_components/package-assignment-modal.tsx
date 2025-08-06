import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/loader";
import { assignPackagesToEventMutationFn, getPackagesQueryFn } from "@/lib/api";
import { Package } from "@/types/package.type";
import { toast } from "sonner";

interface PackageAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  currentPackages?: Package[];
}

const PackageAssignmentModal = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  currentPackages = [],
}: PackageAssignmentModalProps) => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackagesQueryFn,
  });

  const assignPackagesMutation = useMutation({
    mutationFn: assignPackagesToEventMutationFn,
    onSuccess: () => {
      toast.success("Packages assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["event_list"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign packages");
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedPackages(currentPackages.map(pkg => pkg.id));
    }
  }, [isOpen, currentPackages]);

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages(prev => 
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSubmit = () => {
    assignPackagesMutation.mutate({
      eventId,
      packageIds: selectedPackages,
    });
  };

  if (!isOpen) return null;

  const packages = packagesData?.packages || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Assign Packages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">Event: <strong>{eventTitle}</strong></p>
          <p className="text-sm text-gray-500">
            Select packages to make available for this event
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" color="black" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No packages available</p>
            <p className="text-sm text-gray-400">
              Create packages first to assign them to events
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {packages.map((package_) => (
              <div
                key={package_.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
              >
                <Checkbox
                  checked={selectedPackages.includes(package_.id)}
                  onCheckedChange={() => handlePackageToggle(package_.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{package_.name}</h3>
                    <span className="text-green-600 font-semibold">
                      ₱{package_.price}
                    </span>
                  </div>
                  {package_.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {package_.description}
                    </p>
                  )}
                  {package_.isRecommended && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={assignPackagesMutation.isPending}
            className="flex-1"
          >
            {assignPackagesMutation.isPending ? (
              <>
                <Loader size="sm" color="white" />
                Assigning...
              </>
            ) : (
              "Assign Packages"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageAssignmentModal; 