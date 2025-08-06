import { useQuery } from "@tanstack/react-query";
import { getEventPackagesQueryFn } from "@/lib/api";
import { Package } from "@/types/package.type";
import { Check, Star, Camera, Sparkles } from "lucide-react";

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

  // Helper function to parse inclusions string into array
  const parseInclusions = (inclusions?: string): string[] => {
    if (!inclusions) return [];
    
    // Split by common delimiters and clean up
    return inclusions
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Select a Package
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.map((package_) => {
          const isSelected = selectedPackage?.id === package_.id;
          const inclusions = parseInclusions(package_.inclusions);
          
          return (
            <div
              key={package_.id}
              className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-xl"
                  : "border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white"
              } rounded-2xl p-6 h-full flex flex-col`}
              onClick={() => onPackageSelect(package_)}
            >
              {/* Recommended Badge */}
              {package_.isRecommended && (
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1.5 z-10">
                  <Star className="w-3 h-3" />
                  Recommended
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-xl mb-1 ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}>
                      {package_.name}
                    </h4>
                    <p className={`text-sm ${
                      isSelected ? "text-blue-700" : "text-gray-600"
                    }`}>
                      {package_.description || "Professional package with quality service"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="text-leftt mb-6">
                <div className={`text-2xl font-bold ${
                  isSelected ? "text-blue-600" : "text-green-600"
                }`}>
                  ₱{package_.price.toLocaleString()}
                </div>
                {package_.duration && (
                  <div className="text-sm text-gray-500 mt-1">
                    {package_.duration}
                  </div>
                )}
              </div>

              {/* Inclusions Section */}
              <div className="flex-1">
                <h5 className={`font-semibold text-sm mb-3 ${
                  isSelected ? "text-blue-800" : "text-gray-700"
                }`}>
                  What's Included:
                </h5>
                <ul className="space-y-2">
                  {inclusions.length > 0 ? (
                    inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className={`text-sm ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                          {inclusion}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={`text-sm ${isSelected ? "text-blue-800" : "text-gray-500"}`}>
                        No inclusions specified
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Hover Effect Overlay */}
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-200 ${
                isSelected 
                  ? "bg-blue-500/5" 
                  : "bg-blue-500/0 group-hover:bg-blue-500/5"
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackageSelection; 