import { useState } from "react";
import { Button } from "@/components/ui/button";

// Temporary debug component to verify dropdown visibility
export const DebugSearchDropdown = () => {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <Button 
        onClick={() => setShowDebug(true)} 
        className="fixed top-4 right-4 z-[100000] bg-red-500 hover:bg-red-600 text-white"
      >
        Debug Search
      </Button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-[100000] bg-yellow-400 text-black p-4 rounded shadow-2xl max-w-sm">
      <h3 className="font-bold mb-2">Search Debug Info</h3>
      <p className="text-sm mb-2">If you can see this yellow box, z-index works!</p>
      <p className="text-sm mb-2">Try typing in the search box below to see if dropdown appears.</p>
      <Button 
        onClick={() => setShowDebug(false)} 
        size="sm"
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Hide Debug
      </Button>
    </div>
  );
};