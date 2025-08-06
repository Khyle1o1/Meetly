import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import PageTitle from "@/components/PageTitle";
import PackageList from "./_components/package-list";
import CreatePackageModal from "./_components/create-package-modal";
import EmptyState from "./_components/empty-state";
import { getPackagesQueryFn, createPackageMutationFn } from "@/lib/api";

const Packages = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackagesQueryFn,
  });

  const createPackageMutation = useMutation({
    mutationFn: createPackageMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsCreateModalOpen(false);
    },
  });

  const packages = data?.packages || [];

  const handleCreatePackage = (packageData: any) => {
    createPackageMutation.mutate(packageData);
  };

  return (
    <div className="flex flex-col !gap-8">
      <div className="flex items-center justify-between">
        <PageTitle title="Packages" />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Package
        </button>
      </div>

      <ErrorAlert isError={isError} error={error} />

      {isPending ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader size="lg" color="black" />
        </div>
      ) : packages.length === 0 ? (
        <EmptyState onCreatePackage={() => setIsCreateModalOpen(true)} />
      ) : (
        <PackageList packages={packages} />
      )}

      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePackage}
        isLoading={createPackageMutation.isPending}
      />
    </div>
  );
};

export default Packages; 