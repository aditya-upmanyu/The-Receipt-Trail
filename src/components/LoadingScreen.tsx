/**
 * LoadingScreen Component
 * Full-screen loading indicator
 */

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#05070B] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#94A3B8] text-lg">{message}</p>
      </div>
    </div>
  );
}
