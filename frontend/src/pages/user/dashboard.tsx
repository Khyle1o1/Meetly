import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle, XCircle, Package, ArrowRight, Play, X } from "lucide-react";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import { getAvailableEventsQueryFn, getAllBookingsForUserQueryFn } from "@/lib/api";
import { format } from "date-fns";

// Notification Banner Component for Approved Bookings
const ApprovedBookingNotification = ({ booking, onClose, onViewDetails }: { 
  booking: any; 
  onClose: () => void;
  onViewDetails: () => void;
}) => {
  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                You have an approved booking
              </h3>
              <p className="text-gray-600 mb-4">
                Your booking has been approved! Check your email for meeting details.
              </p>
              
              {/* Booking Details Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="font-medium text-gray-900 mb-2">{booking.event.title}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{format(new Date(booking.startTime), "PPP")} at {format(new Date(booking.startTime), "p")}</div>
                  <div>Duration: {booking.event.duration} minutes</div>
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                  {booking.selectedPackage && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="font-medium text-gray-900 text-sm">Selected Package:</div>
                      <div className="text-sm text-gray-600">
                        {booking.selectedPackage.name} - ${booking.selectedPackage.price}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={onViewDetails}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Details
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Separate Modal Component to prevent re-renders
const BookingDetailsModal = ({ booking, onClose }: { booking: any; onClose: () => void }) => {
  if (!booking) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Event Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Event:</span>
                  <p className="text-gray-900">{booking.event.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Host:</span>
                  <p className="text-gray-900">{booking.event.user?.name || 'Unknown Host'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-900">{booking.event.duration} minutes</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location Type:</span>
                  <p className="text-gray-900">{booking.event.locationType}</p>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-900">{format(new Date(booking.startTime), 'PPP')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <p className="text-gray-900">
                    {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className="mt-1">
                    {booking.status === "PENDING" && <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                    {(booking.status === "APPROVED" || booking.status === "SCHEDULED") && <Badge className="bg-green-100 text-green-800">Approved</Badge>}
                    {booking.status === "DECLINED" && <Badge className="bg-red-100 text-red-800">Declined</Badge>}
                    {booking.status === "CANCELLED" && <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <p className="text-gray-900 text-sm">{booking.id}</p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{booking.firstName} {booking.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{booking.guestEmail}</p>
                </div>
                {booking.contactNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span>
                    <p className="text-gray-900">{booking.contactNumber}</p>
                  </div>
                )}
                {booking.schoolName && (
                  <div>
                    <span className="font-medium text-gray-700">School:</span>
                    <p className="text-gray-900">{booking.schoolName}</p>
                  </div>
                )}
                {booking.yearLevel && (
                  <div>
                    <span className="font-medium text-gray-700">Year Level:</span>
                    <p className="text-gray-900">{booking.yearLevel}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {booking.additionalInfo && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                <p className="text-gray-900">{booking.additionalInfo}</p>
              </div>
            )}

            {/* Package Information */}
            {booking.selectedPackage && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Package:</span>
                    <p className="text-gray-900">{booking.selectedPackage.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <p className="text-gray-900">${booking.selectedPackage.price}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Link */}
            {booking.meetLink && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Link</h3>
                <a 
                  href={booking.meetLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {booking.meetLink}
                </a>
              </div>
            )}

            {/* Admin Message */}
            {booking.adminMessage && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Message</h3>
                <p className="text-gray-900">{booking.adminMessage}</p>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timestamps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">{format(new Date(booking.createdAt), 'PPP p')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <p className="text-gray-900">{format(new Date(booking.updatedAt), 'PPP p')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use Portal to render outside the main component tree
  return createPortal(modalContent, document.body);
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Fetch available events
  const { 
    data: availableEventsData, 
    isLoading: isLoadingEvents, 
    isError: isEventsError, 
    error: eventsError 
  } = useQuery({
    queryKey: ["availableEvents"],
    queryFn: getAvailableEventsQueryFn,
  });

  // Fetch all bookings
  const { 
    data: allBookingsData, 
    isLoading: isLoadingBookings, 
    isError: isBookingsError, 
    error: bookingsError 
  } = useQuery({
    queryKey: ["allBookings"],
    queryFn: getAllBookingsForUserQueryFn,
  });

  const availableEvents = useMemo(() => availableEventsData?.events || [], [availableEventsData]);
  const allBookings = useMemo(() => allBookingsData?.allBookings || [], [allBookingsData]);

  // Filter out events that the user has already booked (frontend backup)
  const filteredAvailableEvents = useMemo(() => {
    const bookedEventIds = new Set(allBookings.map((booking: any) => booking.event.id));
    return availableEvents.filter((event: any) => !bookedEventIds.has(event.id));
  }, [availableEvents, allBookings]);

  // Get approved bookings that haven't been dismissed
  const approvedBookings = useMemo(() => {
    return allBookings.filter((booking: any) => 
      (booking.status === "APPROVED" || booking.status === "SCHEDULED") &&
      !dismissedNotifications.has(booking.id)
    );
  }, [allBookings, dismissedNotifications]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { showBookingDetails, selectedBooking: selectedBooking?.id });
  }, [showBookingDetails, selectedBooking]);

  const handleBookNow = useCallback((event: any) => {
    // Navigate to the public event page for booking
    navigate(`/${event.user.username}/${event.slug}`);
  }, [navigate]);

  const handleResumeBooking = useCallback((booking: any) => {
    console.log('Opening booking details for:', booking);
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  }, []);

  const closeBookingDetails = useCallback(() => {
    console.log('Closing booking details');
    setShowBookingDetails(false);
    setSelectedBooking(null);
  }, []);

  const handleDismissNotification = useCallback((bookingId: string) => {
    setDismissedNotifications(prev => new Set([...prev, bookingId]));
  }, []);

  const handleViewNotificationDetails = useCallback((booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "APPROVED":
      case "SCHEDULED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "DECLINED":
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "APPROVED":
      case "SCHEDULED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DECLINED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAvailabilityRange = (event: any) => {
    if (event.showDateRange && event.startDate && event.endDate) {
      const startDate = format(new Date(event.startDate), "MMM d");
      const endDate = format(new Date(event.endDate), "MMM d, yyyy");
      return `${startDate} - ${endDate}`;
    }
    return "Always available";
  };

  if (showBookingDetails && selectedBooking) {
    return (
      <BookingDetailsModal 
        booking={selectedBooking} 
        onClose={closeBookingDetails} 
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Approved Booking Notifications */}
      {approvedBookings.map((booking: any) => (
        <ApprovedBookingNotification
          key={booking.id}
          booking={booking}
          onClose={() => handleDismissNotification(booking.id)}
          onViewDetails={() => handleViewNotificationDetails(booking)}
        />
      ))}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here are the events you can book and your pending bookings.
        </p>
      </div>

      {/* Available Events Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Events to Book</h2>
        </div>
        
        <ErrorAlert isError={isEventsError} error={eventsError} />
        
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" color="black" />
          </div>
        ) : filteredAvailableEvents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">No available events found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailableEvents.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatAvailabilityRange(event)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Hosted by {event.user.name}</span>
                  </div>
                  <Button 
                    onClick={() => handleBookNow(event)}
                    className="w-full mt-4"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Bookings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
        </div>
        
        <ErrorAlert isError={isBookingsError} error={bookingsError} />
        
        {isLoadingBookings ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" color="black" />
          </div>
        ) : allBookings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">No bookings found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allBookings.map((booking: any) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.event.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {booking.guestEmail}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Date:</span> {format(new Date(booking.startTime), 'PPP')}
                    </div>
                    <div>
                      <span className="font-semibold">Time:</span> {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                    </div>
                    <div>
                      <span className="font-semibold">Duration:</span> {booking.event.duration} minutes
                    </div>
                    <div>
                      <span className="font-semibold">Host:</span> {booking.event.user?.name || 'Unknown Host'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusIcon(booking.status)}
                    <div className="text-sm text-gray-600">
                      {booking.status === "PENDING" 
                        ? "Your booking is pending admin approval. You will receive an email notification once it has been processed."
                        : booking.status === "APPROVED" || booking.status === "SCHEDULED"
                        ? "Your booking has been approved! Check your email for meeting details."
                        : booking.status === "DECLINED"
                        ? "Your booking was not approved. Please review your submission and try again if needed."
                        : "Booking status updated."
                      }
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleResumeBooking(booking)}
                    variant="outline"
                    className="w-full"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={closeBookingDetails} 
        />
      )}
    </div>
  );
};

export default UserDashboard; 