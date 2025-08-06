import { z } from "zod";
import { addMinutes, parseISO } from "date-fns";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBookingState } from "@/hooks/use-booking-state";
import { Fragment, useState, useEffect } from "react";
import { CheckIcon, ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { scheduleMeetingMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import PackageSelection from "./package-selection";
import { Package } from "@/types/package.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const bookingFormSchema = z.object({
    lastName: z.string().min(1, "Last name is required"),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    contactNumber: z.string().min(1, "Contact number is required"),
    guestEmail: z.string().email("Invalid email address"),
    schoolName: z.string().min(1, "School name is required"),
    yearLevel: z.string().min(1, "Year level is required"),
    additionalInfo: z.string().optional(),
  });

  type BookingFormData = z.infer<typeof bookingFormSchema>;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      contactNumber: "",
      guestEmail: "",
      schoolName: "",
      yearLevel: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (values: BookingFormData) => {
    if (!eventId || !selectedSlot || !selectedDate) return;
    
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
    formData.append("guestName", `${values.firstName} ${values.lastName}`);
    formData.append("guestEmail", values.guestEmail);
    formData.append("lastName", values.lastName);
    formData.append("firstName", values.firstName);
    if (values.middleName) formData.append("middleName", values.middleName);
    formData.append("contactNumber", values.contactNumber);
    formData.append("schoolName", values.schoolName);
    formData.append("yearLevel", values.yearLevel);
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
    // Validate current step before proceeding
    if (currentStep === 1) {
      const isValid = form.trigger([
        "lastName",
        "firstName", 
        "contactNumber",
        "guestEmail",
        "schoolName",
        "yearLevel"
      ]);
      
      isValid.then((valid) => {
        if (valid) {
          setCurrentStep(2);
        }
      });
    }
  };

  const handleBackStep = () => {
    setCurrentStep(1);
    setPaymentError("");
  };

  const yearLevelOptions = [
    "Junior High School",
    "Senior High School", 
    "College",
    "Post-Grad"
  ];

  const schoolOptions = [
    "BukSU",
    "BNHS",
    "Other"
  ];

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
                  Personal Details
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
            {currentStep === 1 ? "Enter Your Details" : "Complete Payment"}
          </h2>
          
          {/* Package Selection - Show on both steps */}
          <PackageSelection
            eventId={eventId}
            onPackageSelect={setSelectedPackage}
            selectedPackage={selectedPackage}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {currentStep === 1 ? (
                // Step 1: Personal Details
                <div className="space-y-4">
                  {/* Last Name Field */}
                  <FormField
                    name="lastName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Last Name *
                        </Label>
                        <FormControl className="mt-1">
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* First Name Field */}
                  <FormField
                    name="firstName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          First Name *
                        </Label>
                        <FormControl className="mt-1">
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Middle Name Field */}
                  <FormField
                    name="middleName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Middle Name
                        </Label>
                        <FormControl className="mt-1">
                          <Input placeholder="Enter your middle name (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Number Field */}
                  <FormField
                    name="contactNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Contact Number *
                        </Label>
                        <FormControl className="mt-1">
                          <Input placeholder="Enter your contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    name="guestEmail"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Email Address *
                        </Label>
                        <FormControl className="mt-1">
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* School Name Field */}
                  <FormField
                    name="schoolName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Name of School *
                        </Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your school" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolOptions.map((school) => (
                              <SelectItem key={school} value={school}>
                                {school}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Year Level Field */}
                  <FormField
                    name="yearLevel"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="font-semibold !text-base text-[#0a2540]">
                          Year Level *
                        </Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your year level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {yearLevelOptions.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Next Button */}
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="w-full"
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
