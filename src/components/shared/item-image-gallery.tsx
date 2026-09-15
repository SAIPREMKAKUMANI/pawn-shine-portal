import { useState } from "react";
import { useItemImages } from "@/hooks/use-item-images.hook";
import { AuthImage } from "@/components/shared/auth-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, ChevronDown, ChevronUp, Loader2, ZoomIn } from "lucide-react";

interface ItemImageGalleryProps {
  itemId: number;
  itemDescription?: string;
}

export function ItemImageGallery({ itemId, itemDescription }: ItemImageGalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: images, isLoading } = useItemImages(expanded ? itemId : null);

  return (
    <div className="mt-2 text-xs">
      {!expanded ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>View Images</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      ) : (
        <div className="space-y-2 pt-2 border-t mt-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" /> Item Images
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-[11px] text-muted-foreground hover:text-foreground gap-0.5"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
            >
              Hide <ChevronUp className="h-3 w-3" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading images...
            </div>
          ) : !images || images.length === 0 ? (
            <p className="text-muted-foreground italic py-1">No images available for this item.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => {
                const serveUrl = `/items/images/serve/${img.id}`;
                return (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer border rounded-md overflow-hidden bg-background shrink-0 w-20 h-20 shadow-xs transition-transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(serveUrl);
                    }}
                  >
                    <AuthImage
                      src={serveUrl}
                      alt={itemDescription || "Item image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Dialog for Full-size view */}
      {lightboxImage && (
        <Dialog open={true} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="sm:max-w-[600px] p-2 flex flex-col items-center">
            <DialogHeader className="w-full px-4 pt-2">
              <DialogTitle className="text-sm font-normal text-muted-foreground">
                {itemDescription ? `Image: ${itemDescription}` : `Item #${itemId} Image`}
              </DialogTitle>
            </DialogHeader>
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded bg-black/5 p-2">
              <AuthImage
                src={lightboxImage}
                alt="Full size view"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
