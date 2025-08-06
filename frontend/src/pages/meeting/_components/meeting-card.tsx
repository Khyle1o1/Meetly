import { Fragment, useRef, useState } from "react";
import { ChevronDown, Trash2Icon, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingType, PeriodType } from "@/types/api.type";
import { format, parseISO } from "date-fns";
import { locationOptions } from "@/lib/types";
import { PeriodEnum } from "@/hooks/use-meeting-filter";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import { getBackendBaseUrl } from "@/lib/get-env";

const MeetingCard = (props: {
  meeting: MeetingType;
  period: PeriodType;
  isPending: boolean;
  onCancel: () => void;
}) => {
  const { meeting, isPending, period, onCancel } = props;

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
  const detailsRef = useRef<HTMLDivElement>(null);

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

      {/* {Event body} */}
      <div role="buton" className="event-list-body" onClick={toggleDetails}>
        <div
          className="flex flex-row bg-white relative w-full p-6 text-left 
        cursor-pointer transition-colors duration-200 ease-in-out"
        >
          <div
            className="flex-shrink-0 box-border pr-4 pl-10 inline-block
          mb-[5px]"
          >
            <span className="event-time">{formattedTime}</span>
            <span
              className={cn(
                `absolute bg-primary/70
              top-[20px] left-[23px] inline-block box-border w-[30px]
             h-[30px] rounded-full`,
                period === PeriodEnum.CANCELLED && "!bg-destructive/70"
              )}
            ></span>
          </div>

          <div className="flex-1">
            <h5>
              <strong>{meeting.guestName}</strong>
            </h5>
            <p>
              Event type <strong> {meeting.event.title}</strong>
            </p>
          </div>
          {/* {Meeting detail Button} */}
          <div className="flex shrink-0">
            <button className="flex gap-px items-center cursor-pointer !text-[rgba(26,26,26,0.61)] text-base leading-[1.4] whitespace-nowrap">
              <ChevronDown
                fill="rgba(26,26,26,0.61)"
                className=" w-6 h-6
               !fill-[rgba(26,26,26,0.61)]"
              />
              More
            </button>
          </div>
        </div>
      </div>

      {/* {Event Details} */}
      <div
        ref={detailsRef}
        className="event-details overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isShow ? `${detailsRef.current?.scrollHeight}px` : "0px",
          padding: isShow ? "8px 24px 24px 24px" : "0 24px",
        }}
      >
        <div className="flex flex-col-reverse md:flex-row pb-5">
          {period === PeriodEnum.UPCOMING && (
            <div className="box-border shrink-0 w-[80%] md:w-[310px] pr-[80px] pl-[40px] mb-5">
              <div>
                <Button
                  variant="outline"
                  type="button"
                  className="!w-full border-[#476788] text-[#0a2540] font-normal text-sm"
                  onClick={onCancel}
                >
                  {isPending ? (
                    <Loader color="black" />
                  ) : (
                    <Fragment>
                      <Trash2Icon />
                      <span>Cancel</span>
                    </Fragment>
                  )}
                </Button>
              </div>
            </div>
          )}
          <div className="flex-1">
            <ul>
              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Email
                </h5>
                <p className="font-normal text-[15px]">{meeting.guestEmail}</p>
              </li>

              {/* Show additional booking details if available */}
              {isDetailedBooking && (
                <>
                  <li className="mb-4">
                    <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                      Contact Number
                    </h5>
                    <p className="font-normal text-[15px]">{(meeting as any).contactNumber || 'Not provided'}</p>
                  </li>
                  <li className="mb-4">
                    <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                      School
                    </h5>
                    <p className="font-normal text-[15px]">{(meeting as any).schoolName || 'Not provided'}</p>
                  </li>
                  <li className="mb-4">
                    <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                      Year Level
                    </h5>
                    <p className="font-normal text-[15px]">{(meeting as any).yearLevel || 'Not provided'}</p>
                  </li>
                  {(meeting as any).selectedPackage && (
                    <li className="mb-4">
                      <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                        Selected Package
                      </h5>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {(meeting as any).selectedPackage.name} - ₱{(meeting as any).selectedPackage.price}
                        </p>
                      </div>
                    </li>
                  )}
                  {(meeting as any).paymentProofUrl && (
                    <li className="mb-4">
                      <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                        Payment Proof
                      </h5>
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
                    </li>
                  )}
                </>
              )}

              {/* Show package information for all bookings */}
              {meeting.selectedPackage && (
                <li className="mb-4">
                  <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                    Selected Package
                  </h5>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {meeting.selectedPackage.name} - ₱{meeting.selectedPackage.price}
                    </p>
                  </div>
                </li>
              )}

              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Location
                </h5>
                <div className="flex items-center mr-6">
                  {locationOption && (
                    <>
                      <img
                        src={locationOption?.logo as string}
                        alt={locationOption?.label}
                        className="w-5 h-5 mr-2"
                      />
                      <span className="mt-1 font-normal text-[15px]">
                        {locationOption?.label}
                      </span>
                    </>
                  )}
                </div>
              </li>
              <li className="mb-4">
                <h5 className="inline-block mb-1 font-bold text-sm leading-[14px] uppercase">
                  Questions
                </h5>
                <p className="font-normal text-[15px]">
                  {meeting.additionalInfo ? (
                    meeting.additionalInfo
                  ) : (
                    <Fragment>
                      <span className="block font-light text-sm mb-1 text-[rgba(26,26,26,0.61)]">
                        Please share anything that will help prepare for our
                        meeting.
                      </span>
                      <span>Nothing</span>
                    </Fragment>
                  )}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
