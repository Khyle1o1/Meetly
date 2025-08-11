import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import PageTitle from "@/components/PageTitle";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import { toast } from "sonner";
import { CheckIcon, XIcon, EyeIcon, ZoomIn, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { 
  getPendingBookingsQueryFn, 
  updateMeetingStatusMutationFn 
} from "@/lib/api";
import { getBackendBaseUrl } from "@/lib/get-env";

const PendingBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [paymentProofModal, setPaymentProofModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pendingBookings"],
    queryFn: getPendingBookingsQueryFn,
  });

  // Debug payment proof URLs
  useEffect(() => {
    if (data?.pendingBookings) {
      data.pendingBookings.forEach((booking: any) => {
        if (booking.paymentProofUrl) {
          console.log("Payment proof URL:", booking.paymentProofUrl);
          console.log("Full URL:", `${getBackendBaseUrl()}${booking.paymentProofUrl}`);
        }
      });
    }
  }, [data]);

  const updateStatusMutation = useMutation({
    mutationFn: updateMeetingStatusMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingBookings"] });
      toast.success("Booking status updated successfully");
      setSelectedBooking(null);
      setAdminMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking status");
    },
  });

  const pendingBookings = data?.pendingBookings || [];

  const handleApprove = (booking: any) => {
    updateStatusMutation.mutate({
      meetingId: booking.id,
      status: 'APPROVED',
      adminMessage: adminMessage
    });
  };

  const handleDecline = (booking: any) => {
    updateStatusMutation.mutate({
      meetingId: booking.id,
      status: 'DECLINED',
      adminMessage: adminMessage
    });
  };

  const toggleExpanded = (bookingId: string) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'DECLINED':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Pending Bookings" />
      
      <ErrorAlert isError={isError} error={error} />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader size="lg" color="black" />
        </div>
      ) : pendingBookings.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-500">No pending bookings found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingBookings.map((booking: any) => {
            const isExpanded = expandedBookings.has(booking.id);
            
            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {booking.firstName} {booking.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(booking.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(booking.id)}
                        className="p-1 h-auto"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Basic info always visible */}
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Date:</span> {format(new Date(booking.startTime), 'PPP')}
                    </div>
                    <div>
                      <span className="font-semibold">Time:</span> {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                    </div>
                  </div>
                  
                  {booking.selectedPackage && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Package:</strong> {booking.selectedPackage.name} - ₱{booking.selectedPackage.price}
                      </p>
                    </div>
                  )}

                  {/* Expandable content */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Contact:</span> {booking.contactNumber}
                        </div>
                        <div>
                          <span className="font-semibold">School:</span> {booking.schoolName}
                        </div>
                        <div>
                          <span className="font-semibold">Year Level:</span> {booking.yearLevel}
                        </div>
                        <div>
                          <span className="font-semibold">Event:</span> {booking.event?.title}
                        </div>
                      </div>

                      {booking.additionalInfo && (
                        <div>
                          <span className="font-semibold text-sm">Additional Notes:</span>
                          <p className="text-sm text-gray-600 mt-1">{booking.additionalInfo}</p>
                        </div>
                      )}

                      {booking.paymentProofUrl && (
                        <div>
                          <span className="font-semibold text-sm">Payment Proof:</span>
                          <div className="mt-2">
                            <div className="relative group cursor-pointer" onClick={() => {
                              setPaymentProofModal({
                                isOpen: true,
                                imageUrl: `${getBackendBaseUrl()}${booking.paymentProofUrl}`,
                                fileName: booking.paymentProofUrl.split('/').pop() || 'Payment Proof'
                              });
                            }}>
                              <img 
                                src={`${getBackendBaseUrl()}${booking.paymentProofUrl}`}
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
                                onLoad={() => {
                                  console.log("Payment proof image loaded successfully");
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleApprove(booking)}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDecline(booking)}
                          disabled={updateStatusMutation.isPending}
                          variant="destructive"
                        >
                          <XIcon className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                        <Button
                          onClick={() => setSelectedBooking(booking)}
                          variant="outline"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admin Message Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Admin Message (Optional)</h3>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="Enter a message for the user..."
              className="w-full p-3 border rounded-lg mb-4 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBooking(null);
                  setAdminMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleApprove(selectedBooking);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  handleDecline(selectedBooking);
                }}
                variant="destructive"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      )}

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

export default PendingBookings; 