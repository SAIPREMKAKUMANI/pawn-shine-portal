import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  backTo?: string;
  onBackClick?: () => void;
}

export function PageHeader({
  title,
  description,
  badge,
  action,
  backTo,
  onBackClick,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backTo) {
      navigate(backTo);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {(backTo || onBackClick) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="rounded-full h-8 w-8 shadow-sm hover:shadow-md transition-all shrink-0 mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
