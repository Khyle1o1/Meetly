import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { locationOptions, VideoConferencingPlatform } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreateEventMutationFn, getPackagesQueryFn, assignPackagesToEventMutationFn, getUserAvailabilityQueryFn, updateUserAvailabilityMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import DayAvailability from "@/pages/availability/_components/day-availability";
import { dayMapping } from "@/lib/availability";
import type { DayAvailabilityType } from "@/types/api.type";

const NewEventDialog = (props: { btnVariant?: string }) => {
  const { btnVariant } = props;

  const queryClient = useQueryClient();
  const { mutateAsync: createEvent, isPending: isCreatingEvent } = useMutation({
    mutationFn: CreateEventMutationFn,
  });

  const assignPackagesMutation = useMutation({
    mutationFn: assignPackagesToEventMutationFn,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: updateUserAvailabilityMutationFn,
  });

  const [selectedLocationType, setSelectedLocationType] =
    useState<VideoConferencingPlatform | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch packages for selection
  const { data: packagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackagesQueryFn,
  });

  // Fetch current user availability
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ["user_availability"],
    queryFn: getUserAvailabilityQueryFn,
  });

  const packages = packagesData?.packages || [];

  const eventSchema = z.object({
    title: z.string().min(1, "Event name is required"),
    duration: z
      .number()
      .int({ message: "Duration must be a number" })
      .min(1, "Duration is required"),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().min(1, "End date is required"),
    showDateRange: z.boolean().optional(),
    locationType: z
      .enum([VideoConferencingPlatform.FACE_TO_FACE])
      .refine((value) => value !== undefined, {
        message: "Location type is required",
      }),
  }).superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate start date is not in the past if provided
    if (data.startDate) {
      const start = new Date(data.startDate);
      if (start < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date cannot be in the past",
          path: ["startDate"],
        });
      }
    }

    // End date is required and must not be in the past
    if (data.endDate) {
      const end = new Date(data.endDate);
      if (end < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date cannot be in the past",
          path: ["endDate"],
        });
      }
    }

    // If start date present, end date must be >= start date
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be on or after start date",
          path: ["endDate"],
        });
      }
    }
  });

  type EventFormData = z.infer<typeof eventSchema>;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      duration: 30,
      description: "",
      startDate: "",
      endDate: "",
      showDateRange: false,
    },
  });
  // Date constraints for inputs
  const todayStr = new Date().toISOString().split("T")[0];
  const startDateValue = form.watch("startDate");
  const endMin = startDateValue && startDateValue > todayStr ? startDateValue : todayStr;


  // Availability inline form
  const timeGapSchema = z
    .number()
    .int({ message: "Time gap must be an integer" })
    .min(1, { message: "Time gap must be at least 1 minute" })
    .refine((value) => [15, 30, 45, 60, 120].includes(value), {
      message: "Time gap must be 15, 30, 45, 60, or 120 minutes",
    });

  const availabilitySchema = z
    .object({
      timeGap: timeGapSchema,
      days: z.array(
        z.object({
          day: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          isAvailable: z.boolean(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      data.days.forEach((item, index) => {
        if (item.isAvailable && item.startTime && item.endTime) {
          if (item.endTime <= item.startTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End time must be greater than start time",
              path: ["availability", index, "startTime"],
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End time must be greater than start time",
              path: ["availability", index, "endTime"],
            });
          }
        }
      });
    });

  type WeeklyHoursFormData = z.infer<typeof availabilitySchema>;

  const availabilityForm = useForm<WeeklyHoursFormData>({
    resolver: zodResolver(availabilitySchema),
    mode: "onChange",
    defaultValues: {
      timeGap: 30,
      days: [],
    },
  });

  useEffect(() => {
    const avail = availabilityData?.availability;
    if (avail) {
      availabilityForm.reset({
        timeGap: avail.timeGap,
        days: (avail.days || []) as DayAvailabilityType[],
      });
    }
  }, [availabilityData, availabilityForm]);

  const { isValid } = form.formState;

  const handleLocationTypeChange = (value: VideoConferencingPlatform) => {
    setSelectedLocationType(value);
    form.setValue("locationType", value as VideoConferencingPlatform.FACE_TO_FACE);
    form.trigger("locationType");
  };

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleTimeSelect = useCallback(
    (day: string, field: "startTime" | "endTime", time: string) => {
      const index = availabilityForm
        .getValues("days")
        .findIndex((item) => item.day === day);
      if (index !== -1) {
        availabilityForm.setValue(`days.${index}.${field}` as const, time, {
          shouldValidate: true,
        });
        availabilityForm.trigger(`days.${index}.startTime` as const);
        availabilityForm.trigger(`days.${index}.endTime` as const);
      }
    },
    [availabilityForm]
  );

  const onRemove = useCallback(
    (day: string) => {
      const index = availabilityForm
        .getValues("days")
        .findIndex((item) => item.day === day);
      if (index !== -1) {
        availabilityForm.setValue(`days.${index}.isAvailable` as const, false);
        availabilityForm.setValue(`days.${index}.startTime` as const, "09:00");
        availabilityForm.setValue(`days.${index}.endTime` as const, "17:00");
      }
    },
    [availabilityForm]
  );

  const onSubmit = async (data: EventFormData) => {
    try {
      // Validate availability before proceeding
      const availabilityIsValid = await availabilityForm.trigger();
      if (!availabilityIsValid) {
        toast.error("Please fix availability errors");
        return;
      }

      // Save availability changes
      const availabilityValues = availabilityForm.getValues();
      await updateAvailabilityMutation.mutateAsync(availabilityValues);

      // Create event
      const response = await createEvent({
        ...data,
        duration: data.duration,
        description: data.description || "",
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        showDateRange: data.showDateRange || false,
      });

      const eventId = (response as any)?.data?.event?.id;

      // Optional: assign packages
      if (eventId && selectedPackages.length > 0) {
        try {
          await assignPackagesMutation.mutateAsync({
            eventId,
            packageIds: selectedPackages,
          });
          toast.success("Event created and packages assigned successfully");
        } catch {
          toast.error("Event created but failed to assign packages");
        }
      } else {
        toast.success("Event created successfully");
      }

      queryClient.invalidateQueries({
        queryKey: ["event_list"],
      });
      setSelectedLocationType(null);
      setSelectedPackages([]);
      setIsOpen(false);
      form.reset();
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={btnVariant ? "default" : "outline"}
          size="lg"
          className={cn(
            `!w-auto !border-[#476788] !text-[#0a2540] !font-normal !text-sm`,
            btnVariant && "!text-white !border-primary"
          )}
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Event Type</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] !px-0 pb-0 h-[90vh] md:h-[85vh] max-h-[90vh] flex flex-col !overflow-hidden min-h-0">
        <DialogHeader className="px-6 shrink-0">
          <DialogTitle className="text-xl">Add a new event type</DialogTitle>
          <DialogDescription>
            Create a new event type for people to book times with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="px-6 flex-1 overflow-y-auto overscroll-contain min-h-0">
              {/* Top Row - Event Name and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-semibold !text-base">
                        Event name
                      </Label>
                      <FormControl className="mt-2">
                        <Input placeholder="Name your event" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="duration"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-semibold !text-base">Duration (minutes)</Label>
                      <FormControl className="mt-2">
                        <Input
                          {...field}
                          type="number"
                          placeholder="Duration"
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value > 0) {
                              field.onChange(parseInt(e.target.value, 10));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <Label className="font-semibold !text-base">
                      Description
                    </Label>
                    <FormControl className="mt-2">
                      <Textarea
                        className="focus-visible:ring-ring/0"
                        placeholder="Description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range and Show Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-semibold !text-base">Start Date</Label>
                      <FormControl className="mt-2">
                        <Input
                          {...field}
                          type="date"
                          placeholder="Start date"
                          min={todayStr}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="font-semibold !text-base">End Date</Label>
                      <FormControl className="mt-2">
                        <Input
                          {...field}
                          type="date"
                          placeholder="End date"
                          min={endMin}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="showDateRange"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                          Show date range to public
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Make the event's date range visible to users when booking
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Package Selection and Location Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                {/* Package Selection */}
                {packages.length > 0 && (
                  <div className="space-y-3">
                    <Label className="font-semibold !text-base">
                      Available Packages (Optional)
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {packages.map((package_) => (
                        <div
                          key={package_.id}
                          className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedPackages.includes(package_.id)}
                            onCheckedChange={() => handlePackageToggle(package_.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm truncate">{package_.name}</h3>
                              <span className="text-green-600 font-semibold text-sm ml-2">
                                ₱{package_.price}
                              </span>
                            </div>
                            {package_.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {package_.description}
                              </p>
                            )}
                            {package_.isRecommended && (
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Type */}
                <FormField
                  name="locationType"
                  control={form.control}
                  render={() => (
                    <FormItem>
                      <Label className="font-semibold !text-base">
                        Location Type
                      </Label>
                      <FormControl className="w-full mt-2">
                        <div className="grid grid-cols-1 gap-2">
                          {locationOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={cn(
                                `w-full h-[70px] cursor-pointer border disabled:pointer-events-none border-[#B2B2B2] mx-auto pt-1 pr-0.5 pl-0.5 rounded-[5px] flex flex-col items-center justify-center`,
                                selectedLocationType === option.value &&
                                  "border-primary bg-primary/10"
                              )}
                              onClick={() => {
                                handleLocationTypeChange(option.value as VideoConferencingPlatform);
                              }}
                            >
                              <img
                                src={option.logo as string}
                                alt={option.label}
                                width="20px"
                                height="20px"
                              />
                              <span className="mt-1 text-sm">
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability Settings (Relocated here) */}
              <div className="mb-4">
                <Label className="font-semibold !text-base">Availability</Label>
                <div className="text-sm text-muted-foreground mb-2">Set your weekly hours and time gap. These settings determine when people can book this and your other events.</div>

                <Form {...availabilityForm}>
                  <div className="space-y-3 pt-0">
                    {/* Time Gap Input */}
                    <FormField
                      name="timeGap"
                      control={availabilityForm.control}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4 p-0 pb-1 mt-2">
                          <Label className="text-[15px] font-medium shrink-0">
                            Time Gap (mins):
                          </Label>
                          <div className="relative w-full max-w-[140px]">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                className="w-[120px] !py-[10px] min-h-[46px] px-[14px] !h-auto"
                                value={field.value || ""}
                                min={1}
                                onChange={(e) => {
                                  const value = e.target.value.trim();
                                  if (value === "") {
                                    field.onChange(null);
                                  } else {
                                    const parsedValue = parseInt(value, 10);
                                    if (!isNaN(parsedValue) && parsedValue > 0) {
                                      field.onChange(parsedValue);
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage className="absolute top-full left-0 mt-2" />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Days list */}
                    <div className="space-y-1">
                      {isAvailabilityLoading ? (
                        <div className="text-sm text-muted-foreground py-4">Loading availability...</div>
                      ) : (
                        availabilityForm.watch("days").map((day, index) => (
                          <DayAvailability
                            key={day.day}
                            day={day.day}
                            startTime={day.startTime}
                            endTime={day.endTime}
                            isAvailable={day.isAvailable}
                            index={index}
                            form={availabilityForm as unknown as any}
                            dayMapping={dayMapping}
                            onRemove={onRemove}
                            onTimeSelect={handleTimeSelect}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </Form>
              </div>
            </div>

            <DialogFooter
              className="bg-[#f6f7f9] border-t px-6 py-3 !mt-6 border-[#e5e7eb] rounded-b-[8px] sticky bottom-0 z-10 shrink-0"
            >
              <Button type="submit" disabled={!isValid || isCreatingEvent || updateAvailabilityMutation.isPending}>
                {isCreatingEvent || updateAvailabilityMutation.isPending ? (
                  <Loader size="sm" color="white" />
                ) : (
                  <span>Create</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewEventDialog;
