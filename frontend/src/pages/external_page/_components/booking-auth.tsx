import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn, loginMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { useBookingStore } from "@/store/booking-store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Lock } from "lucide-react";

// Define the form schemas using Zod
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

interface BookingAuthProps {
  onBack: () => void;
}

export function BookingAuth({ onBack }: BookingAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBookingUser, setBookingToken, setBookingExpiresAt } = useBookingStore();

  // Get the return URL from search params
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Check for pre-filled values from URL parameters
  const preFilledEmail = searchParams.get("email");
  const preFilledFirstName = searchParams.get("firstName");
  const preFilledLastName = searchParams.get("lastName");

  const signUpMutation = useMutation({
    mutationFn: registerMutationFn,
  });

  const signInMutation = useMutation({
    mutationFn: loginMutationFn,
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: preFilledFirstName || "",
      lastName: preFilledLastName || "",
      middleName: "",
      email: preFilledEmail || "",
      phoneNumber: "",
      password: "",
    },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: preFilledEmail || "",
      password: "",
    },
  });

  // Set pre-filled values if they exist
  useEffect(() => {
    if (preFilledEmail) {
      signUpForm.setValue("email", preFilledEmail);
      signInForm.setValue("email", preFilledEmail);
    }
    if (preFilledFirstName) {
      signUpForm.setValue("firstName", preFilledFirstName);
    }
    if (preFilledLastName) {
      signUpForm.setValue("lastName", preFilledLastName);
    }
  }, [preFilledEmail, preFilledFirstName, preFilledLastName, signUpForm, signInForm]);

  const handleSignUp = (values: SignUpFormValues) => {
    if (signUpMutation.isPending) return;

    signUpMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Account created successfully! Please sign in.");
        setIsSignUp(false);
        // Pre-fill the sign in form with the email
        signInForm.setValue("email", values.email);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to create account");
      },
    });
  };

  const handleSignIn = (values: SignInFormValues) => {
    if (signInMutation.isPending) return;

    signInMutation.mutate(values, {
      onSuccess: (data) => {
        const user = data.user;
        const accessToken = data.accessToken;
        const expiresAt = data.expiresAt;

        // Set booking authentication (separate from admin auth)
        setBookingUser({
          id: user.id,
          name: user.name,
          email: user.email,
        });
        setBookingToken(accessToken);
        setBookingExpiresAt(expiresAt);
        toast.success("Signed in successfully!");

        // Navigate back to the booking page with preserved state
        navigate(returnUrl);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message || "Failed to sign in");
      },
    });
  };

  const isPending = signUpMutation.isPending || signInMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Information */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Please create an account or sign in to continue with your booking. Your selected date and time will be preserved.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-4 hover:bg-gray-100 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isSignUp ? "Create Account" : "Sign In"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isSignUp ? "Please create an account to continue your booking." : "Welcome back! Please sign in to continue."}
                </p>
              </div>
            </div>

            {/* Form */}
            {isSignUp ? (
              <>
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
                    {/* Name Fields Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        name="firstName"
                        control={signUpForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              First Name
                            </Label>
                            <FormControl>
                              <Input 
                                {...field} 
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
                        control={signUpForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Last Name
                            </Label>
                            <FormControl>
                              <Input 
                                {...field} 
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
                        control={signUpForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Middle Name
                            </Label>
                            <FormControl>
                              <Input 
                                {...field} 
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
                      control={signUpForm.control}
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
                      control={signUpForm.control}
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
                      control={signUpForm.control}
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
                  </form>
                  {/* Debug Panel */}
                  <div style={{ background: '#f8f8f8', padding: 16, borderRadius: 8, marginTop: 16 }}>
                    <strong>Debug Panel</strong>
                    <div style={{ fontSize: 12 }}>
                      <div><b>Values:</b> {JSON.stringify(signUpForm.getValues())}</div>
                      <div><b>Errors:</b> {JSON.stringify(signUpForm.formState.errors)}</div>
                      <div><b>Dirty Fields:</b> {JSON.stringify(signUpForm.formState.dirtyFields)}</div>
                      <div><b>Touched Fields:</b> {JSON.stringify(signUpForm.formState.touchedFields)}</div>
                    </div>
                  </div>
                </Form>
              </>
            ) : (
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                  <FormField
                    name="email"
                    control={signInForm.control}
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
                            placeholder="Enter your email" 
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={signInForm.control}
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

                  <Button 
                    disabled={isPending} 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isPending ? (
                      <div className="flex items-center space-x-2">
                        <Loader size="sm" color="white" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Toggle Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                {isSignUp ? (
                  <div className="text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors"
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors"
                    >
                      Create account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Powered by Meetly */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full">
              <span className="mr-2">⚡</span>
              POWERED BY Meetly
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 