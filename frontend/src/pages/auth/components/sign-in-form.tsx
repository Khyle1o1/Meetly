import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Command, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/store";
import { loginMutationFn } from "@/lib/api";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { cn } from "@/lib/utils";
import { LoginResponseType } from "@/types/api.type";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const { setUser, setAccessToken, setExpiresAt } = useStore();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInFormValues) => {
    console.log("Form values:", values);
    if (isPending) return;

    mutate(values, {
      onSuccess: (data: LoginResponseType) => {
        const user = data.user;
        const accessToken = data.accessToken;
        const expiresAt = data.expiresAt;

        setUser(user);
        setAccessToken(accessToken);
        setExpiresAt(expiresAt);
        toast.success("Login successfully");

        // Redirect based on user role
        if (user.role === "admin") {
          navigate(PROTECTED_ROUTES.ADMIN_DASHBOARD);
        } else {
          navigate(PROTECTED_ROUTES.USER_DASHBOARD);
        }
      },
      onError: (error: any) => {
        console.log(error);
        toast.error(error.message || "Failed to login");
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* { Top Header} */}
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div
                className="flex aspect-square size-8 items-center 
          justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <Command className="size-5" />
              </div>
              <span className="sr-only">Meetly</span>
            </Link>
            <h2 className="text-xl font-bold text-[#0a2540]">
              Log into your Meetly account
            </h2>
          </div>

          {/* {Form Card} */}
          <div
            className="w-full bg-white flex flex-col gap-5 rounded-[6px] p-[38px_25px]"
            style={{
              boxShadow: "rgba(0, 74, 116, 0.15) 0px 1px 5px",
              border: "1px solid #d4e0ed",
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label className="font-semibold !text-sm">
                      Email address
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="subcribeto@techwithemma.com"
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
                    <Label className="font-semibold !text-sm">Password</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="***********"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? <Loader color="white" /> : "Login"}
              </Button>
            </div>
          </div>

          {/* {Bottom Section} */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-[#6b7280]">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="font-semibold text-[#0a2540] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
