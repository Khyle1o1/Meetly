import { z } from "zod";
import { addMinutes, parseISO } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBookingState } from "@/hooks/use-booking-state";
import { Fragment, useState, useEffect } from "react";
import { CheckIcon, ArrowLeft, ArrowRight, CreditCard, User, Mail, Phone, AlertCircle } from "lucide-react";
import { scheduleMeetingMutationFn, checkExistingBookingQueryFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import PackageSelection from "./package-selection";
import { Package } from "@/types/package.type";
import PaymentUploadMandatory from "./payment-upload-mandatory";
import PaymentInstructions from "./payment-instructions";
import { useBookingStore } from "@/store/booking-store";
import { useNavigate, useLocation } from "react-router-dom";

const BookingForm = (props: { eventId: string; duration: number }) => {
  const { eventId, duration } = props;
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentError, setPaymentError] = useState("");

  const { selectedDate, isSuccess, selectedSlot, handleSuccess } =
    useBookingState();

  const { bookingToken, bookingUser } = useBookingStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate, isPending } = useMutation({
    mutationFn: scheduleMeetingMutationFn,
  });

  // Check for existing booking if user is authenticated
  const { data: existingBookingData } = useQuery({
    queryKey: ["existing_booking", bookingUser?.email],
    queryFn: () => checkExistingBookingQueryFn(bookingUser!.email),
    enabled: !!bookingUser?.email,
  });

  // Check if user is authenticated for booking (separate from admin auth)
  const isUserAuthenticatedForBooking = () => {
    // For booking, we need a separate authentication context
    // Admin authentication doesn't count for booking purposes
    return !!(bookingToken && bookingUser);
  };

  // Check authentication on component mount
  useEffect(() => {
    if (!isUserAuthenticatedForBooking()) {
      // Redirect to auth with return URL
      const returnUrl = location.pathname + location.search;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [navigate, location]);

  // If not authenticated for booking, don't render the form
  if (!isUserAuthenticatedForBooking()) {
    return null;
  }

  // Check if user has existing booking
  const hasExistingBooking = existingBookingData?.hasExistingBooking;

  // If user has existing booking, show message instead of form
  if (hasExistingBooking && bookingUser) {
    return (
      <div className="max-w-md pt-6 px-6">
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

  const bookingFormSchema = z.object({
    additionalInfo: z.string().optional(),
  });

  type BookingFormData = z.infer<typeof bookingFormSchema>;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      additionalInfo: "",
    },
  });

  const onSubmit = async (values: BookingFormData) => {
    if (!eventId || !selectedSlot || !selectedDate || !bookingUser) return;
    
    // Validate payment proof is uploaded
    if (!selectedFile) {
      setPaymentError("Payment proof is required to complete your booking");
      return;
    }
    
    setPaymentError("");
    
    // Decode the selected slot to get the slotDate
    const decodedSlotDate = decodeURIComponent(selectedSlot);

    // Parse the slotDate into a Date object using date-fns
    const startTime = parseISO(decodedSlotDate);

    // Calculate the end time by adding the duration of event (in minutes) to the start time
    const endTime = addMinutes(startTime, duration);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("startTime", startTime.toISOString());
    formData.append("endTime", endTime.toISOString());
    formData.append("guestName", bookingUser.name);
    formData.append("guestEmail", bookingUser.email);
    formData.append("lastName", bookingUser.lastName || "");
    formData.append("firstName", bookingUser.firstName || "");
    if (bookingUser.middleName) formData.append("middleName", bookingUser.middleName);
    formData.append("contactNumber", bookingUser.phoneNumber || "");
    if (values.additionalInfo) formData.append("additionalInfo", values.additionalInfo);
    if (selectedPackage?.id) formData.append("selectedPackageId", selectedPackage.id);
    formData.append("paymentProof", selectedFile);

    console.log("Form Data:", Object.fromEntries(formData));

    if (isPending) return;

    mutate(formData as any, {
      onSuccess: (response) => {
        console.log(response);
        handleSuccess(true);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to schedule event");
      },
    });
  };

  const handleNextStep = () => {
    // For Step 1, only validate that a package is selected
    if (currentStep === 1) {
      if (selectedPackage) {
        setCurrentStep(2);
      } else {
        toast.error("Please select a package to continue");
      }
    }
  };

  const handleBackStep = () => {
    setCurrentStep(1);
    setPaymentError("");
  };

  return (
    <div className="max-w-md pt-6 px-6">
      {isSuccess ? (
        // Success Message Component
        <div className="text-center pt-4">
          <h2 className="text-2xl flex items-center justify-center gap-2 font-bold mb-4">
            <span className="size-5 flex items-center justify-center rounded-full bg-green-700">
              <CheckIcon className="w-3 h-3 !stroke-4 text-white " />
            </span>
            Booking Submitted
          </h2>
          <p className="mb-4">Your booking has been submitted successfully and is pending approval.</p>
          {selectedPackage && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected Package:</strong> {selectedPackage.name} - ₱{selectedPackage.price}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            You will receive an email confirmation once your booking is reviewed.
          </p>
        </div>
      ) : (
        <Fragment>
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                  Package Selection
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                  Payment
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Step {currentStep} of 2
            </p>
          </div>

          <h2 className="text-xl font-bold mb-6">
            {currentStep === 1 ? "Select Your Package" : "Complete Payment"}
          </h2>
          
          {/* User Information Display */}
          {bookingUser && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Booking for:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-20">Name:</span>
                  <span className="text-gray-800">{bookingUser.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-600 w-20">Email:</span>
                  <span className="text-gray-800">{bookingUser.email}</span>
                </div>
                {bookingUser.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-600 w-20">Phone:</span>
                    <span className="text-gray-800">{bookingUser.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Package Selection - Show on both steps */}
          <PackageSelection
            eventId={eventId}
            onPackageSelect={setSelectedPackage}
            selectedPackage={selectedPackage}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {currentStep === 1 ? (
                // Step 1: Package Selection Only
                <div className="space-y-4">
                  {/* Next Button */}
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="w-full"
                    disabled={!selectedPackage}
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                // Step 2: Payment
                <div className="space-y-6">
                  {/* Payment Instructions */}
                  <PaymentInstructions selectedPackage={selectedPackage} />

                  {/* Payment Upload */}
                  <PaymentUploadMandatory
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    error={paymentError}
                  />

                  {/* Additional Info Field */}
                  <FormField
                    name="additionalInfo"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540] ">
                          Additional notes
                        </Label>
                        <FormControl className="mt-1">
                          <Textarea
                            placeholder="Please share anything that will help prepare for our meeting."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleBackStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      disabled={isPending} 
                      type="submit"
                      className="flex-1"
                    >
                      {isPending ? (
                        <Loader color="white" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Submit Booking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </Fragment>
      )}
    </div>
  );
};

export default BookingForm;
