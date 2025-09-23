import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/stores/demoStore";

export const DemoBanner = () => {
  const { isDemoMode, setDemoMode } = useDemoStore();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <div>
          <span className="text-sm font-medium text-amber-100">
            Demo Mode Active
          </span>
          <p className="text-xs text-amber-200/80">
            Showing curated mock wallet data for demonstration purposes
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDemoMode(false)}
        className="text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
        aria-label="Disable demo mode"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};