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
import { Fragment, useState } from "react";
import { CheckIcon, ExternalLink } from "lucide-react";
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
import PaymentUpload from "./payment-upload";

const BookingForm = (props: { eventId: string; duration: number }) => {
  const { eventId, duration } = props;
  const [meetLink, setMeetLink] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { selectedDate, isSuccess, selectedSlot, handleSuccess } =
    useBookingState();

  const { mutate, isPending } = useMutation({
    mutationFn: scheduleMeetingMutationFn,
  });

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
    if (selectedFile) formData.append("paymentProof", selectedFile);

    console.log("Form Data:", Object.fromEntries(formData));

    if (isPending) return;

    mutate(formData as any, {
      onSuccess: (response) => {
        console.log(response);
        setMeetLink(response.data.meetLink);
        handleSuccess(true);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to schedule event");
      },
    });
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
          <h2 className="text-xl font-bold mb-6">Enter Details</h2>
          
          {/* Package Selection */}
          <PackageSelection
            eventId={eventId}
            onPackageSelect={setSelectedPackage}
            selectedPackage={selectedPackage}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Payment Upload */}
              <PaymentUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
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

              {/* Submit Button */}
              <Button disabled={isPending} type="submit">
                {isPending ? <Loader color="white" /> : "Submit Booking"}
              </Button>
            </form>
          </Form>
        </Fragment>
      )}
    </div>
  );
};

export default BookingForm;
