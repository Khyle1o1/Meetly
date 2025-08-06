import { Package } from "@/types/package.type";
import { CreditCard, Building2, Smartphone, FileText } from "lucide-react";

interface PaymentInstructionsProps {
  selectedPackage: Package | null;
}

const PaymentInstructions = ({ selectedPackage }: PaymentInstructionsProps) => {
  // Ensure paymentAmount is always a valid number
  const paymentAmount = selectedPackage && selectedPackage.price 
    ? Number(selectedPackage.price) || 0 
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Instructions
        </h3>
        
        <div className="space-y-4">
          {/* Payment Amount */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Amount</h4>
            <p className="text-2xl font-bold text-blue-600">₱{paymentAmount.toFixed(2)}</p>
            {selectedPackage && (
              <p className="text-sm text-gray-600 mt-1">{selectedPackage.name}</p>
            )}
          </div>

          {/* Bank Transfer */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bank Transfer
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Bank:</span> BDO (Banco de Oro)
              </div>
              <div>
                <span className="font-medium">Account Name:</span> Emma Tech Services
              </div>
              <div>
                <span className="font-medium">Account Number:</span> 1234-5678-9012-3456
              </div>
              <div>
                <span className="font-medium">Account Type:</span> Savings Account
              </div>
            </div>
          </div>

          {/* GCash */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              GCash
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">GCash Number:</span> 0917-123-4567
              </div>
              <div>
                <span className="font-medium">Account Name:</span> Emma Tech Services
              </div>
            </div>
          </div>

          {/* Reference Note Format */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reference Note Format
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                Please include this reference note when making your payment:
              </p>
              <div className="bg-gray-100 p-3 rounded border-l-4 border-blue-500">
                <p className="font-mono text-sm">
                  Booking-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Example: Booking-2024-01-15
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Please keep your payment receipt for verification</li>
          <li>• Payment must be completed within 24 hours of booking</li>
          <li>• Your booking will be confirmed once payment is verified</li>
          <li>• For any payment issues, contact us at support@emmatech.com</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentInstructions; 