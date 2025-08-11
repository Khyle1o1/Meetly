import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import {
  User,
  Mail,
  Phone,
  School,
  Calendar,
  Clock,
  Search,
  ZoomIn
} from "lucide-react";
import { format } from "date-fns";
import { getBackendBaseUrl } from "@/lib/get-env";

const getBookingStatusQueryFn = async (email: string) => {
  const response = await fetch(`/api/meetings/public/status?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Failed to fetch booking status");
  return response.json();
};

const BookingStatus = () => {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [paymentProofModal, setPaymentProofModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookingStatus", searchEmail],
    queryFn: () => getBookingStatusQueryFn(searchEmail),
    enabled: !!searchEmail,
  });

  const handleSearch = () => {
    if (email.trim()) {
      setSearchEmail(email.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'APPROVED':
      case 'SCHEDULED':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'DECLINED':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return "Your booking is currently being reviewed. You will receive an email notification once it has been processed.";
      case 'APPROVED':
      case 'SCHEDULED':
        return "Your booking has been approved! Check your email for meeting details.";
      case 'DECLINED':
        return "Your booking was not approved. Please review your submission and try again if needed.";
      default:
        return "Your booking status has been updated.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Booking Status</h1>
          <p className="text-gray-600">Enter your email address to view your booking status</p>
        </div>

        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={!email.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" color="black" />
          </div>
        )}

        {isError && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p>No bookings found for this email address.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please check your email address and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data?.bookings && data.bookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
            {data.bookings.map((booking: any) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{booking.event?.title}</CardTitle>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{booking.firstName} {booking.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{booking.guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Contact:</span>
                      <span>{booking.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">School:</span>
                      <span>{booking.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Date:</span>
                      <span>{format(new Date(booking.startTime), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                      </span>
                    </div>
                  </div>

                  {booking.selectedPackage && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Package:</strong> {booking.selectedPackage.name} - ₱{booking.selectedPackage.price}
                      </p>
                    </div>
                  )}

                  {booking.additionalInfo && (
                    <div>
                      <span className="font-semibold text-sm">Additional Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{booking.additionalInfo}</p>
                    </div>
                  )}

                  {booking.adminMessage && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <span className="font-semibold text-sm text-yellow-800">Message from Admin:</span>
                      <p className="text-sm text-yellow-700 mt-1">{booking.adminMessage}</p>
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

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{getStatusMessage(booking.status)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
};

export default BookingStatus; 