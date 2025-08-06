export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  BOOKING_AUTH: "/auth",
};

export const PROTECTED_ROUTES = {
  EVENT_TYPES: "/app/event_types",
  INTEGRATIONS: "/app/integrations",
  AVAILBILITIY: "/app/availability/schedules",
  MEETINGS: "/app/scheduled_events",
  PACKAGES: "/app/packages",
  ADMIN_PENDING_BOOKINGS: "/app/admin/pending-bookings",
  // User dashboard routes
  USER_DASHBOARD: "/app/dashboard",
  USER_BOOKINGS: "/app/bookings",
  USER_BOOKING_HISTORY: "/app/bookings/history",
  // Admin routes
  ADMIN_DASHBOARD: "/app/admin",
  ADMIN_USERS: "/app/admin/users",
  ADMIN_USER_MANAGEMENT: "/app/admin/users/manage",
};

export const PUBLIC_ROUTES = {
  USER_EVENTS: "/:username",
  USER_SINGLE_EVENT: "/:username/:slug",
};
