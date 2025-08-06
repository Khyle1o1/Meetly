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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateEventMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { Switch } from "@/components/ui/switch";

const NewEventDialog = (props: { btnVariant?: string }) => {
  const { btnVariant } = props;

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: CreateEventMutationFn,
  });

  const [selectedLocationType, setSelectedLocationType] =
    useState<VideoConferencingPlatform | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);

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
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["event_list"],
          });
          setSelectedLocationType(null);
          setIsOpen(false);
          form.reset();
          toast.success("Event created successfully");
        },
        onError: () => {
          toast.success("Failed to create event");
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
      <DialogContent className="sm:max-w-[500px] !px-0 pb-0">
        <DialogHeader className="px-6">
          <DialogTitle className="text-xl">Add a new event type</DialogTitle>
          <DialogDescription>
            Create a new event type for people to book times with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6">
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
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-semibold !text-base">
                      Description
                    </Label>
                    <FormControl className="mt-2">
                      <Textarea
                        className="focus-visible:ring-ring/0"
                        placeholder="Description"
                        {...field}
                      />
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

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
