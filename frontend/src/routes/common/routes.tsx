import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from "./routePaths";
import SignIn from "@/pages/auth/signin";
import SignUp from "@/pages/auth/signup";
import EventType from "@/pages/event_type";
import Meetings from "@/pages/meeting";
import Availability from "@/pages/availability";
import Packages from "@/pages/packages";
import PendingBookings from "@/pages/admin/pending-bookings";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import UserDashboard from "@/pages/user/dashboard";
import UserEventsPage from "@/pages/external_page/user-events";
import UserSingleEventPage from "@/pages/external_page/user-single-event";
import BookingAuthPage from "@/pages/external_page/booking-auth-page";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.EVENT_TYPES, element: <EventType /> },
  { path: PROTECTED_ROUTES.MEETINGS, element: <Meetings /> },
  { path: PROTECTED_ROUTES.AVAILBILITIY, element: <Availability /> },
  { path: PROTECTED_ROUTES.PACKAGES, element: <Packages /> },
  { path: PROTECTED_ROUTES.ADMIN_PENDING_BOOKINGS, element: <PendingBookings /> },
  // User dashboard routes
  { path: PROTECTED_ROUTES.USER_DASHBOARD, element: <UserDashboard /> },
  // Admin routes
  { path: PROTECTED_ROUTES.ADMIN_DASHBOARD, element: <AdminDashboard /> },
  { path: PROTECTED_ROUTES.ADMIN_USERS, element: <UserManagement /> },
];

export const publicRoutePaths = [
  { path: PUBLIC_ROUTES.USER_EVENTS, element: <UserEventsPage /> },
  { path: PUBLIC_ROUTES.USER_SINGLE_EVENT, element: <UserSingleEventPage /> },
  { path: AUTH_ROUTES.BOOKING_AUTH, element: <BookingAuthPage /> },
];
