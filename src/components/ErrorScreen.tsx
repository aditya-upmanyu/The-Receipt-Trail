/**
 * ErrorScreen Component
 * Full-screen error state with retry
 */

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-[#05070B] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-[#E8F1FF] mb-4">Failed to Load Data</h2>
        <p className="text-[#94A3B8] mb-6">{error}</p>
        <button
          type="button"
          onClick={onRetry || (() => window.location.reload())}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
