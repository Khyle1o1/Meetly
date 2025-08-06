import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventPackagesQueryFn } from "@/lib/api";
import { Package } from "@/types/package.type";

interface PackageSelectionProps {
  eventId: string;
  onPackageSelect: (package_: Package) => void;
  selectedPackage?: Package | null;
}

const PackageSelection = ({ eventId, onPackageSelect, selectedPackage }: PackageSelectionProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["event_packages", eventId],
    queryFn: () => getEventPackagesQueryFn(eventId),
    enabled: !!eventId,
  });

  const packages = data?.packages || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || packages.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select a Package
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((package_) => (
          <div
            key={package_.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPackage?.id === package_.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onPackageSelect(package_)}
          >
            {package_.isRecommended && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Recommended
              </div>
            )}
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {package_.icon && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">{package_.icon}</span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{package_.name}</h4>
                  {package_.duration && (
                    <p className="text-sm text-gray-600">{package_.duration}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ₱{package_.price}
                </div>
              </div>
            </div>

            {package_.description && (
              <p className="text-sm text-gray-600 mb-3">{package_.description}</p>
            )}

            {package_.inclusions && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Inclusions:</span>
                <p className="mt-1">{package_.inclusions}</p>
              </div>
            )}

            {selectedPackage?.id === package_.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageSelection; 