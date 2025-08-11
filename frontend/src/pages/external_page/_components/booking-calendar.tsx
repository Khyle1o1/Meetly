import { format } from "date-fns";
import { Calendar } from "@/components/calendar";
import { CalendarDate, DateValue, today } from "@internationalized/date";
import { useBookingState } from "@/hooks/use-booking-state";
import { decodeSlot, formatSlot } from "@/lib/helper";
import { getPublicAvailabilityByEventIdQueryFn, checkExistingBookingQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";
import HourButton from "@/components/HourButton";
import { useBookingStore } from "@/store/booking-store";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface BookingCalendarProps {
  eventId: string;
  minValue?: DateValue;
  defaultValue?: DateValue;
  startDate?: string;
  endDate?: string;
  showDateRange?: boolean;
}

const BookingCalendar = ({
  eventId,
  minValue,
  defaultValue,
  startDate,
  endDate,
  showDateRange,
}: BookingCalendarProps) => {
  const {
    hourType,
    selectedDate,
    selectedSlot,
    handleSelectDate,
    handleSelectSlot,
    handleNext,
    setHourType,
  } = useBookingState();

  const { bookingToken, bookingUser } = useBookingStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["availbility_single_event", eventId],
    queryFn: () => getPublicAvailabilityByEventIdQueryFn(eventId),
  });

  // Check for existing booking if user is authenticated
  const { data: existingBookingData } = useQuery({
    queryKey: ["existing_booking", bookingUser?.email],
    queryFn: () => checkExistingBookingQueryFn(bookingUser!.email),
    enabled: !!bookingUser?.email,
  });

  const availability = data?.data || [];

  // Check if user has existing booking
  const hasExistingBooking = existingBookingData?.hasExistingBooking;

  // If user has existing booking, show message instead of calendar
  if (hasExistingBooking && bookingUser) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Booking Already Exists
          </h2>
          <p className="text-yellow-700 mb-4">
            You have already made a booking with this account. Only one booking per account is allowed.
          </p>
          {existingBookingData?.existingBooking && (
            <div className="bg-white rounded-lg p-4 mb-4 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Your Current Booking:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Event:</strong> {existingBookingData.existingBooking.event?.title}</p>
                <p><strong>Status:</strong> {existingBookingData.existingBooking.status}</p>
                <p><strong>Created:</strong> {new Date(existingBookingData.existingBooking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-yellow-600">
            If you need to modify your booking, please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // Get time slots for the selected date
  const timeSlots = selectedDate
    ? availability?.find(
        (day) =>
          day.day ===
          format(selectedDate.toDate("Asia/Manila"), "EEEE").toUpperCase()
      )?.slots || []
    : [];

  const isDateUnavailable = (date: DateValue) => {
    const manilaTz = "Asia/Manila";
    const dateObj = date.toDate(manilaTz);

    // Disable past dates based on Philippines date
    const manilaToday = today(manilaTz).toDate(manilaTz);
    // Compare by date only
    const manilaTodayMidnight = new Date(manilaToday.getFullYear(), manilaToday.getMonth(), manilaToday.getDate());
    const dateMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    if (dateMidnight < manilaTodayMidnight) {
      return true;
    }

    // Check if date is within the configured date range (if showDateRange is true)
    if (showDateRange && startDate && endDate) {
      const startManila = new Date(new Date(startDate).toLocaleString("en-US", { timeZone: manilaTz }));
      const endManila = new Date(new Date(endDate).toLocaleString("en-US", { timeZone: manilaTz }));
      const startMidnight = new Date(startManila.getFullYear(), startManila.getMonth(), startManila.getDate());
      const endMidnight = new Date(endManila.getFullYear(), endManila.getMonth(), endManila.getDate());

      if (dateMidnight < startMidnight || dateMidnight > endMidnight) {
        return true;
      }
    }

    // Get the day of the week (e.g., "MONDAY")
    const dayOfWeek = format(dateObj, "EEEE").toUpperCase();
    // Check if the day is available
    const dayAvailability = availability.find((day) => day.day === dayOfWeek);
    return !dayAvailability?.isAvailable;
  };

  const handleChangeDate = (newDate: DateValue) => {
    handleSelectSlot(null);
    handleSelectDate(newDate as CalendarDate); // Update useBookingState hook
  };

  // Check if user is authenticated for booking (separate from admin auth)
  const isUserAuthenticatedForBooking = () => {
    return !!(bookingToken && bookingUser);
  };

  const handleSelectSlotWithAuth = (slot: string) => {
    if (!isUserAuthenticatedForBooking()) {
      const returnUrl = location.pathname + location.search;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    handleSelectSlot(slot);
  };

  const handleNextWithAuth = () => {
    if (!isUserAuthenticatedForBooking()) {
      const returnUrl = location.pathname + location.search;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    handleNext();
  };

  const selectedTime = decodeSlot(selectedSlot, "Asia/Manila", hourType);

  return (
    <div className="relative lg:flex-[1_1_50%] w-full flex-shrink-0 transition-all duration-220 ease-out p-4 pr-0">
      {/* Loader Overlay */}
      {isFetching && (
        <div className="flex bg-white/60 !z-30 absolute w-[95%] h-full items-center justify-center">
          <Loader size="lg" color="black" />
        </div>
      )}

      <div className="flex flex-col h-full mx-auto pt-[25px]">
        <h2 className="text-xl mb-5 font-bold">Select a Date &amp; Time</h2>
        
        {/* Authentication Notice - Show only if not authenticated for booking */}
        {!isUserAuthenticatedForBooking() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Please create an account to continue your booking.
              </p>
            </div>
          </div>
        )}
        
        <div className="w-full flex flex-col md:flex-row lg:flex-[1_1_300px]">
          <div className="w-full flex justify-start max-w-xs md:max-w-full lg:max-w-sm">
            <Calendar
              className="w-auto md:w-full lg:!w-auto"
              minValue={minValue}
              defaultValue={defaultValue}
              value={selectedDate}
              timezone={"Asia/Manila"}
              onChange={handleChangeDate}
              isDateUnavailable={isDateUnavailable}
            />
          </div>
          {selectedDate && availability ? (
            <div className="w-full flex-shrink-0 mt-3 lg:mt-0 max-w-xs md:max-w-[40%] pt-0 overflow-hidden md:ml-[-15px]">
              <div className="w-full pb-3  flex flex-col md:flex-row justify-between pr-8">
                <h3 className=" mt-0 mb-[10px] font-normal text-base leading-[38px]">
                  {format(selectedDate.toDate("Asia/Manila"), "EEEE d")}
                </h3>

                <div className="flex h-9 w-full max-w-[107px] items-center border rounded-sm">
                  <HourButton
                    label="12h"
                    isActive={hourType === "12h"}
                    onClick={() => setHourType("12h")}
                  />
                  <HourButton
                    label="24h"
                    isActive={hourType === "24h"}
                    onClick={() => setHourType("24h")}
                  />
                </div>
              </div>

              <div
                className="flex-[1_1_100px] pr-[8px] overflow-x-hidden overflow-y-auto scrollbar-thin
             scrollbar-track-transparent scroll--bar h-[400px]"
              >
                {timeSlots.map((slot, i) => {
                  const formattedSlot = formatSlot(slot, "Asia/Manila", hourType);
                  return (
                    <div role="list" key={i}>
                      <div
                        role="listitem"
                        className="m-[10px_10px_10px_0] relative text-[15px]"
                      >
                        {/* Selected Time and Next Button */}
                        <div
                          className={`absolute inset-0 z-20 flex items-center gap-1.5 justify-between
                             transform transition-all duration-400 ease-in-out ${
                               selectedTime === formattedSlot
                                 ? "translate-x-0 opacity-100"
                                 : "translate-x-full opacity-0"
                             }`}
                        >
                          <button
                            type="button"
                            className="w-full h-[52px] text-white rounded-[4px] bg-black/60 font-semibold disabled:opacity-100 disabled:pointer-events-none tracking-wide"
                            disabled
                          >
                            {formattedSlot}
                          </button>
                          <button
                            type="button"
                            className="w-full cursor-pointer h-[52px] bg-[rgb(0,105,255)] text-white rounded-[4px] hover:bg-[rgba(0,105,255,0.8)] font-semibold tracking-wide"
                            onClick={handleNextWithAuth}
                          >
                            Next
                          </button>
                        </div>

                        {/* Time Slot Button */}
                        <button
                          type="button"
                          className={`w-full h-[52px] cursor-pointer border border-[rgba(0,105,255,0.5)] text-[rgb(0,105,255)] rounded-[4px] font-semibold hover:border-2 hover:border-[rgb(0,105,255)] tracking-wide transition-all duration-400 ease-in-out
                         ${
                           selectedTime === formattedSlot
                             ? "opacity-0"
                             : "opacity-100"
                         }
                           `}
                          onClick={() => handleSelectSlotWithAuth(slot)}
                        >
                          {formattedSlot}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* {Error Alert } */}
      <ErrorAlert isError={isError} error={error} />
    </div>
  );
};

export default BookingCalendar;
