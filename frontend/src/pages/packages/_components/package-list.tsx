// import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePackageMutationFn } from "@/lib/api";
import { Package } from "@/types/package.type";

interface PackageListProps {
  packages: Package[];
}

const PackageList = ({ packages }: PackageListProps) => {
  const queryClient = useQueryClient();

  const deletePackageMutation = useMutation({
    mutationFn: deletePackageMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  const handleDelete = (packageId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const handleEdit = (_package: Package) => {
    // TODO: Implement edit flow
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((package_) => (
        <div
          key={package_.id}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {package_.icon && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">{package_.icon}</span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {package_.name}
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(package_)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(package_.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          {package_.description && (
            <p className="text-gray-600 mb-4">{package_.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Price:</span>
              <span className="font-semibold text-green-600">
                ₱{package_.price}
              </span>
            </div>

            {package_.duration && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Duration:</span>
                <span className="text-gray-700">{package_.duration}</span>
              </div>
            )}

            {package_.inclusions && (
              <div className="mt-3">
                <span className="text-gray-500 text-sm">Inclusions:</span>
                <p className="text-gray-700 text-sm mt-1">{package_.inclusions}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              {package_.isRecommended && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Recommended
                </span>
              )}
              {!package_.isActive && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackageList; 