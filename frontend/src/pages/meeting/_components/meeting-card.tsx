import { Fragment, useState } from "react";
import { ChevronDown, Trash2Icon, ZoomIn, ChevronUp, Package2, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingType, PeriodType } from "@/types/api.type";
import { format, parseISO } from "date-fns";
import { locationOptions } from "@/lib/types";
import { PeriodEnum } from "@/hooks/use-meeting-filter";
import { Loader } from "@/components/loader";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import { getBackendBaseUrl } from "@/lib/get-env";

const MeetingCard = (props: {
  meeting: MeetingType;
  period: PeriodType;
  isPending: boolean;
  onCancel: () => void;
}) => {
  const { meeting, isPending, period, onCancel } = props;

  // Debug logging
  console.log("Meeting data:", meeting);
  console.log("Selected package:", meeting.selectedPackage);

  const [isShow, setIsShow] = useState(false);
  const [paymentProofModal, setPaymentProofModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });

  // Format the date and time
  const startTime = parseISO(meeting.startTime);
  const endTime = parseISO(meeting.endTime);
  const formattedDate = format(startTime, "EEEE, d MMMM yyyy"); // e.g., "Wednesday, 19 March 2025"
  const formattedTime = `${format(startTime, "h:mm a")} – ${format(
    endTime,
    "h:mm a"
  )}`;

  const locationOption = locationOptions.find(
    (option) => option.value === meeting.event.locationType
  );

  const toggleDetails = () => {
    setIsShow(!isShow);
  };

  // Check if this is a booking with additional details (has firstName, lastName, etc.)
  const isDetailedBooking = (meeting as any).firstName && (meeting as any).lastName;

  return (
    <div className="w-full">
      <h2
        className="day-header p-[16px_24px] border-y
      border-[#D4E16F] bg-[#fafafa] text-base font-bold tracking-wide"
      >
        {formattedDate}
      </h2>

      <Card className="overflow-hidden border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {meeting.guestName}
              </CardTitle>
              <p className="text-sm text-gray-600">Event type {meeting.event.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDetails}
                className="p-1 h-auto"
              >
                {isShow ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Basic info always visible */}
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Time:</span> {formattedTime}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {meeting.guestEmail}
            </div>
          </div>
          
          {/* Package information - redesigned to be more attractive */}
          {meeting.selectedPackage ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-blue-900">{meeting.selectedPackage.name}</h4>
                    {meeting.selectedPackage.isRecommended && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">₱{meeting.selectedPackage.price.toLocaleString()}</span>
                  </div>
                  {meeting.selectedPackage.description && (
                    <p className="text-sm text-blue-600 mt-1 line-clamp-2">{meeting.selectedPackage.description}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                  <Package2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-700">No Package Selected</h4>
                  <p className="text-sm text-gray-500">This booking was made without a package</p>
                </div>
              </div>
            </div>
          )}

          {/* Expandable content */}
          {isShow && (
            <div className="space-y-4 pt-4 border-t">
              {/* Show additional booking details if available */}
              {isDetailedBooking && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-700">Contact:</span> 
                    <p className="text-gray-600">{(meeting as any).contactNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">School:</span> 
                    <p className="text-gray-600">{(meeting as any).schoolName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Year Level:</span> 
                    <p className="text-gray-600">{(meeting as any).yearLevel || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Event:</span> 
                    <p className="text-gray-600">{meeting.event.title}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm bg-green-50 p-3 rounded-lg">
                <div>
                  <span className="font-semibold text-green-700">Location:</span>
                  <div className="flex items-center mt-1">
                    {locationOption && (
                      <>
                        <img
                          src={locationOption?.logo as string}
                          alt={locationOption?.label}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-sm text-green-600">{locationOption?.label}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {meeting.additionalInfo && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <span className="font-semibold text-sm text-yellow-800">Additional Notes:</span>
                  <p className="text-sm text-yellow-700 mt-1">{meeting.additionalInfo}</p>
                </div>
              )}

              {(meeting as any).paymentProofUrl && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="font-semibold text-sm text-purple-800">Payment Proof:</span>
                  <div className="mt-2">
                    <div className="relative group cursor-pointer" onClick={() => {
                      setPaymentProofModal({
                        isOpen: true,
                        imageUrl: `${getBackendBaseUrl()}${(meeting as any).paymentProofUrl}`,
                        fileName: (meeting as any).paymentProofUrl.split('/').pop() || 'Payment Proof'
                      });
                    }}>
                      <img 
                        src={`${getBackendBaseUrl()}${(meeting as any).paymentProofUrl}`}
                        alt="Payment Proof" 
                        className="max-w-xs rounded-lg border hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          console.error("Failed to load payment proof image:", e);
                          e.currentTarget.style.display = 'none';
                          // Show a fallback message
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'text-sm text-gray-500 p-2 border rounded';
                          fallbackDiv.textContent = 'Payment proof image could not be loaded';
                          e.currentTarget.parentNode?.appendChild(fallbackDiv);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {period === PeriodEnum.UPCOMING && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    className="border-red-300 text-red-700 hover:bg-red-50 font-normal text-sm"
                    onClick={onCancel}
                  >
                    {isPending ? (
                      <Loader color="black" />
                    ) : (
                      <Fragment>
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </Fragment>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Proof Zoom Modal */}
      <ImageZoomModal
        isOpen={paymentProofModal.isOpen}
        imageUrl={paymentProofModal.imageUrl}
        fileName={paymentProofModal.fileName}
        onClose={() => setPaymentProofModal({ isOpen: false, imageUrl: "", fileName: "" })}
      />
    </div>
  );
};

export default MeetingCard;
