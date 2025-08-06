export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
};

export const PROTECTED_ROUTES = {
  EVENT_TYPES: "/app/event_types",
  INTEGRATIONS: "/app/integrations",
  AVAILBILITIY: "/app/availability/schedules",
  MEETINGS: "/app/scheduled_events",
  PACKAGES: "/app/packages",
  ADMIN_PENDING_BOOKINGS: "/app/admin/pending-bookings",
};

export const PUBLIC_ROUTES = {
  USER_EVENTS: "/:username",
  USER_SINGLE_EVENT: "/:username/:slug",
};
