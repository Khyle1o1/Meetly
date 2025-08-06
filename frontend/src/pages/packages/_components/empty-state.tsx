interface EmptyStateProps {
  onCreatePackage: () => void;
}

const EmptyState = ({ onCreatePackage }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">📦</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No packages yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Create your first package to offer different service tiers to your clients.
        Packages can include different durations, prices, and features.
      </p>
      <button
        onClick={onCreatePackage}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Your First Package
      </button>
    </div>
  );
};

export default EmptyState; 