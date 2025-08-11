import { Fragment } from "react";
import { useParams } from "react-router-dom";
import { today, parseDate } from "@internationalized/date";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "./_components/page-container";
import BookingCalendar from "./_components/booking-calendar";
import BookingForm from "./_components/booking-form";
import { useBookingState } from "@/hooks/use-booking-state";
import EventDetails from "./_components/event-details";
import { getSinglePublicEventBySlugQueryFn } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";

const UserSingleEventPage = () => {
  const param = useParams();
  const username = param.username as string;
  const slug = param.slug as string;

  const { next, selectedDate } = useBookingState();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["public_single_event"],
    queryFn: () =>
      getSinglePublicEventBySlugQueryFn({
        username,
        slug,
      }),
  });

  const event = data?.event;

  // Calculate the minimum date for the calendar (Asia/Manila)
  const getMinValue = () => {
    const manilaTz = "Asia/Manila";
    const manilaToday = today(manilaTz);

    if (event?.showDateRange && event?.startDate) {
      const startDate = new Date(event.startDate);
      const start = parseDate(startDate.toISOString().split("T")[0]);
      // min is the later of startDate and Manila today
      return start.compare(manilaToday) > 0 ? start : manilaToday;
    }
    return manilaToday;
  };

  // Calculate the default value for the calendar (Asia/Manila)
  const getDefaultValue = () => {
    const manilaTz = "Asia/Manila";
    const manilaToday = today(manilaTz);

    if (event?.showDateRange && event?.startDate) {
      const startDate = new Date(event.startDate);
      const start = parseDate(startDate.toISOString().split("T")[0]);
      return start.compare(manilaToday) > 0 ? start : manilaToday;
    }
    return manilaToday;
  };

  return (
    <PageContainer
      isLoading={isLoading}
      className={cn(
        `!min-w-auto sm:!w-auto`,
        isFetching || isError ? "sm:!min-w-[72%]" : "",
        selectedDate && "sm:!w-[98%]"
      )}
    >
      {/* {Error Alert } */}
      <ErrorAlert isError={isError} error={error} />

      {isFetching || isError ? (
        <div className="flex items-center justify-center min-h-[15vh]">
          <Loader size="lg" color="black" />
        </div>
      ) : (
        event && (
          <div className="w-full flex flex-col lg:flex-row items-stretch justify-stretch p-0 px-1">
            {/* {Event Details} */}
            <EventDetails
              eventTitle={event?.title}
              description={event?.description}
              user={event?.user}
              eventLocationType={event?.locationType}
              username={username || ""}
              duration={event?.duration}
              startDate={event?.startDate}
              endDate={event?.endDate}
              showDateRange={event?.showDateRange}
            />
            {/* {Calendar & Booking form} */}
            {/* {Calendar & Booking form} */}
            <div className="min-w-sm max-w-3xl flex-shrink-0 flex-1">
              {next ? (
                <Fragment>
                  {/* {Booking Form} */}
                  <BookingForm eventId={event.id} duration={event.duration} />
                </Fragment>
              ) : (
                <Fragment>
                  {/* {Booking Calendar} */}
                  <BookingCalendar
                    eventId={event.id}
                    minValue={getMinValue()}
                    defaultValue={getDefaultValue()}
                    startDate={event.startDate}
                    endDate={event.endDate}
                    showDateRange={event.showDateRange}
                  />
                </Fragment>
              )}
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
};

export default UserSingleEventPage;
