import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Command, User, Mail, Phone, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/routes/common/routePaths";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";

// Define the form schema using Zod
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    console.log("Form values:", values);
    if (isPending) return;

    mutate(values, {
      onSuccess: () => {
        toast.success("Registered successfully");
        navigate(AUTH_ROUTES.SIGN_IN);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to Sign up");
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-8 w-full", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-3 font-medium"
            >
              <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                <Command className="size-6" />
              </div>
              <span className="sr-only">Meetly</span>
            </Link>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign up with Meetly for free
              </h2>
              <p className="text-gray-600 text-lg">
                Create your account to start scheduling meetings
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        First Name
                      </Label>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="John"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Last Name
                      </Label>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Doe"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="middleName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Middle Name
                      </Label>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Michael (optional)"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john.doe@example.com"
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                name="phoneNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Password
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                disabled={isPending}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <Loader size="sm" color="white" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to={AUTH_ROUTES.SIGN_IN}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Terms and Privacy */}
      <div className="text-balance text-center text-sm text-gray-500">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
