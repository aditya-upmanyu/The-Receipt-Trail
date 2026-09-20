/**
 * Main App Component
 * Handles routing and global state with lazy-loaded routes
 */

import { useState, lazy, Suspense } from "react";
import { Home, Compass, BookOpen, Network, Menu, X } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useReceipts } from "./hooks/useReceipts";
import "./App.css";

// Lazy load route components for better performance
const Landing = lazy(() => import("./pages/Landing").then(module => ({ default: module.Landing })));
const Explore = lazy(() => import("./pages/Explore").then(module => ({ default: module.Explore })));
const Story = lazy(() => import("./pages/Story").then(module => ({ default: module.Story })));
const Connections = lazy(() => import("./pages/Connections").then(module => ({ default: module.Connections })));

type View = "landing" | "explore" | "story" | "connections";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#05070B] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#94A3B8] text-lg">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { receipts, moments, chapters, loading, error } = useReceipts();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg">Loading your archive...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#E8F1FF] mb-4">Failed to Load Data</h2>
          <p className="text-[#94A3B8] mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Landing view
  if (currentView === "landing") {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Landing onEnter={() => setCurrentView("explore")} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Main app views
  const navigation = [
    { id: "explore" as const, label: "Explore", icon: Compass },
    { id: "story" as const, label: "Story", icon: BookOpen },
    { id: "connections" as const, label: "Connections", icon: Network },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#05070B]">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button
                type="button"
                onClick={() => setCurrentView("landing")}
                className="flex items-center gap-2 text-[#E8F1FF] hover:text-cyan-400 transition-colors"
                aria-label="Go to home"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold hidden sm:inline">LIFE ARCHIVE</span>
              </button>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
                {navigation.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCurrentView(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentView === id
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-[#94A3B8] hover:text-[#E8F1FF] hover:bg-[#0D111A]"
                    }`}
                    aria-current={currentView === id ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#94A3B8] hover:text-[#E8F1FF]"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
                {navigation.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCurrentView(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === id
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-[#94A3B8] hover:text-[#E8F1FF] hover:bg-[#0D111A]"
                    }`}
                    aria-current={currentView === id ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Main content with Suspense for lazy loading */}
        <main>
          <Suspense fallback={<LoadingFallback />}>
            {currentView === "explore" && <Explore receipts={receipts} />}
            {currentView === "story" && <Story chapters={chapters} />}
            {currentView === "connections" && <Connections moments={moments} />}
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
