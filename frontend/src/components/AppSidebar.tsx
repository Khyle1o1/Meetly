import {
  CalendarRange,
  ClockIcon,
  Command,
  LayoutGrid,
  LinkIcon,
  LucideIcon,
  PackageIcon,
  Shield,
  Users,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { useAdmin } from "@/hooks/use-admin";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
  separator?: boolean;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { state } = useSidebar();
  const { isAdmin } = useAdmin();

  const pathname = location.pathname;

  // Admin menu items
  const adminItems: ItemType[] = [
    {
      title: "Dashboard",
      url: PROTECTED_ROUTES.ADMIN_DASHBOARD,
      icon: Home,
    },
    {
      title: "Event types",
      url: PROTECTED_ROUTES.EVENT_TYPES,
      icon: LinkIcon,
    },
    {
      title: "Packages",
      url: PROTECTED_ROUTES.PACKAGES,
      icon: PackageIcon,
    },
    {
      title: "Meetings",
      url: PROTECTED_ROUTES.MEETINGS,
      icon: CalendarRange,
    },
    {
      title: "Integrations & apps",
      url: PROTECTED_ROUTES.INTEGRATIONS,
      icon: LayoutGrid,
      separator: true,
    },
    {
      title: "Availability",
      url: PROTECTED_ROUTES.AVAILBILITIY,
      icon: ClockIcon,
    },
    {
      title: "User Management",
      url: PROTECTED_ROUTES.ADMIN_USERS,
      icon: Users,
      separator: true,
    },
    {
      title: "Pending Bookings",
      url: PROTECTED_ROUTES.ADMIN_PENDING_BOOKINGS,
      icon: Shield,
    },
  ];

  // Regular user menu items
  const userItems: ItemType[] = [
    {
      title: "Dashboard",
      url: PROTECTED_ROUTES.USER_DASHBOARD,
      icon: Home,
    },
    {
      title: "Event types",
      url: PROTECTED_ROUTES.EVENT_TYPES,
      icon: LinkIcon,
    },
    {
      title: "Meetings",
      url: PROTECTED_ROUTES.MEETINGS,
      icon: CalendarRange,
    },
    {
      title: "Integrations & apps",
      url: PROTECTED_ROUTES.INTEGRATIONS,
      icon: LayoutGrid,
      separator: true,
    },
    {
      title: "Availability",
      url: PROTECTED_ROUTES.AVAILBILITIY,
      icon: ClockIcon,
    },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={`${
        state !== "collapsed" ? "w-[260px]" : ""
      } !bg-white !border-[#D4E162]`}
      {...props}
    >
      <SidebarHeader
        className={`!py-2 relative ${
          state !== "collapsed" ? "!px-5" : "!px-3"
        }`}
      >
        <div className="flex h-[50px] items-center gap-1 justify-start ">
          <div
            className="flex aspect-square size-6 items-center 
          justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Command className="size-4" />
          </div>
          {state !== "collapsed" && (
            <div className="grid flex-1 text-left text-2xl leading-tight ml-px">
              <h2 className="truncate font-medium">Meetly</h2>
            </div>
          )}

          <SidebarTrigger
            className={`-ml-1 cursor-pointer ${
              state === "collapsed" &&
              "absolute -right-5 z-20 rounded-full bg-white border transform rotate-180"
            }`}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="hover:!bg-[#e5efff] data-[active=true]:!bg-[#e5efff]"
                isActive={item.url === pathname}
                asChild
              >
                <Link
                  to={item.url}
                  className="!text-[16px] !p-[12px_8px_12px_16px] min-h-[48px] rounded-[8px]
                  !font-semibold
                  "
                >
                  <item.icon className="!w-5 !h-5 !stroke-2" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
} 