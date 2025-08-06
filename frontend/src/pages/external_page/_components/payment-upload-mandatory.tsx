import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import { Upload, X, FileText, Image, ZoomIn, AlertCircle } from "lucide-react";

interface PaymentUploadMandatoryProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
}

const PaymentUploadMandatory = ({ onFileSelect, selectedFile, error }: PaymentUploadMandatoryProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.");
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size too large. Maximum size is 5MB.");
      return;
    }

    onFileSelect(file);
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8" />;
    
    if (selectedFile.type.startsWith("image/")) {
      return <Image className="w-8 h-8" />;
    }
    
    return <FileText className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label className="font-semibold !text-base text-[#0a2540] flex items-center gap-2">
        Payment Proof *
        <span className="text-red-500">(Required)</span>
      </Label>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : error 
                ? "border-red-300 bg-red-50" 
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon()}
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your payment proof here, or{" "}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <Input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileInput}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, JPG, PDF (Max 5MB)
              </p>
              <p className="text-xs text-red-500 mt-1 font-medium">
                Payment proof is required to complete your booking
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✓ Payment proof uploaded successfully
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith("image/") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = URL.createObjectURL(selectedFile);
                    setPreviewModal({
                      isOpen: true,
                      imageUrl: url,
                      fileName: selectedFile.name
                    });
                  }}
                  className="text-blue-600 hover:text-blue-700"
                  title="Preview"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <ImageZoomModal
        isOpen={previewModal.isOpen}
        imageUrl={previewModal.imageUrl}
        fileName={previewModal.fileName}
        onClose={() => {
          setPreviewModal({ isOpen: false, imageUrl: "", fileName: "" });
          // Clean up the object URL
          if (previewModal.imageUrl) {
            URL.revokeObjectURL(previewModal.imageUrl);
          }
        }}
      />
    </div>
  );
};

export default PaymentUploadMandatory; 