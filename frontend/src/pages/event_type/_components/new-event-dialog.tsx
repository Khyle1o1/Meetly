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
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreateEventMutationFn, getPackagesQueryFn, assignPackagesToEventMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "@/types/package.type";

const NewEventDialog = (props: { btnVariant?: string }) => {
  const { btnVariant } = props;

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: CreateEventMutationFn,
  });

  const assignPackagesMutation = useMutation({
    mutationFn: assignPackagesToEventMutationFn,
  });

  const [selectedLocationType, setSelectedLocationType] =
    useState<VideoConferencingPlatform | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch packages for selection
  const { data: packagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackagesQueryFn,
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
    endDate: z.string().optional(),
    showDateRange: z.boolean().optional(),
    locationType: z
      .enum([VideoConferencingPlatform.FACE_TO_FACE])
      .refine((value) => value !== undefined, {
        message: "Location type is required",
      }),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
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

  const onSubmit = (data: EventFormData) => {
    console.log("Form Data:", data);
    mutate(
      {
        ...data,
        duration: data.duration,
        description: data.description || "",
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        showDateRange: data.showDateRange || false,
      },
      {
        onSuccess: (response) => {
          // Store the created event ID for package assignment
          setCreatedEventId(response.data.event.id);
          
          // If packages are selected, assign them to the event
          if (selectedPackages.length > 0) {
            assignPackagesMutation.mutate(
              {
                eventId: response.data.event.id,
                packageIds: selectedPackages,
              },
              {
                onSuccess: () => {
                  toast.success("Event created and packages assigned successfully");
                },
                onError: () => {
                  toast.error("Event created but failed to assign packages");
                },
              }
            );
          } else {
            toast.success("Event created successfully");
          }
          
          queryClient.invalidateQueries({
            queryKey: ["event_list"],
          });
          setSelectedLocationType(null);
          setSelectedPackages([]);
          setCreatedEventId(null);
          setIsOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to create event");
        },
      }
    );
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
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] !px-0 pb-0">
        <DialogHeader className="px-6">
          <DialogTitle className="text-xl">Add a new event type</DialogTitle>
          <DialogDescription>
            Create a new event type for people to book times with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6">
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
                      <Label className="font-semibold !text-base">End Date (optional)</Label>
                      <FormControl className="mt-2">
                        <Input
                          {...field}
                          type="date"
                          placeholder="End date"
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
            </div>

            <DialogFooter
              className="bg-[#f6f7f9] border-t px-6 py-3 !mt-6
             border-[#e5e7eb] rounded-b-[8px]"
            >
              <Button type="submit" disabled={!isValid || isPending}>
                {isPending ? (
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
