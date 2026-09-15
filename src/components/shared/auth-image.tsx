import { useAuthImage } from "@/hooks/use-auth-image.hook";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined | null;
  alt?: string;
  className?: string;
  fallbackText?: string;
}

export function AuthImage({ src, alt = "Image", className, fallbackText, ...props }: AuthImageProps) {
  const authSrc = useAuthImage(src);

  if (!src) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted/40 text-muted-foreground rounded p-2 text-xs", className)}>
        <ImageIcon className="h-4 w-4 mb-1 opacity-50" />
        <span>{fallbackText || "No image"}</span>
      </div>
    );
  }

  if (!authSrc) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30 text-muted-foreground rounded p-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <img src={authSrc} alt={alt} className={cn("object-cover rounded", className)} {...props} />;
}
