import { XIcon, ZoomIn, Download } from "lucide-react";
import { Button } from "./button";

interface ImageZoomModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

const ImageZoomModal = ({ isOpen, imageUrl, fileName, onClose }: ImageZoomModalProps) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">{fileName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-gray-500 hover:text-gray-700"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <img 
              src={imageUrl}
              alt={fileName}
              className="w-full h-auto max-h-[70vh] object-contain rounded"
              onError={(e) => {
                console.error("Failed to load image in modal:", e);
                e.currentTarget.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'text-center text-gray-500 p-8 border rounded';
                fallbackDiv.textContent = 'Image could not be loaded';
                e.currentTarget.parentNode?.appendChild(fallbackDiv);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomModal; 