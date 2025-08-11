import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/store/booking-store";

const BookingHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { bookingUser, bookingToken, clearBookingAuth } = useBookingStore();

  const isLoggedIn = !!bookingUser && !!bookingToken;

  const displayName = useMemo(() => {
    if (!bookingUser) return "";
    if (bookingUser.firstName || bookingUser.lastName) {
      return `${bookingUser.firstName ?? ""} ${bookingUser.lastName ?? ""}`.trim();
    }
    return bookingUser.name || bookingUser.email || "";
  }, [bookingUser]);

  const handleLogin = () => {
    const returnUrl = location.pathname + location.search;
    navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleLogout = () => {
    clearBookingAuth();
    const returnUrl = location.pathname + location.search;
    navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-[rgba(26,26,26,0.1)]">
      <div className="max-w-[1000px] mx-auto px-3 py-2 flex items-center justify-between">
        <div className="text-sm text-[#0a2540] font-medium truncate">
          {isLoggedIn ? (
            <span className="truncate">Signed in as {displayName || bookingUser?.email}</span>
          ) : (
            <span className="truncate">You are not signed in</span>
          )}
        </div>
        <div>
          {isLoggedIn ? (
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button size="sm" onClick={handleLogin}>Login</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHeader; 