import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <EmptyState 
          icon={AlertTriangle} 
          title="404 - Page Not Found" 
          description="The page you are looking for does not exist or has been moved." 
        />
        <Button onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Return Home
        </Button>
      </div>
    </div>
  );
}
