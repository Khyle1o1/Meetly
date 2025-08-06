# Authentication Flow for Booking System

## Overview

This implementation adds a mandatory authentication requirement to the booking flow. Users must now create an account or sign in before they can complete a booking.

## New Flow

### Before (Original Flow)
1. User visits booking page
2. User selects a date and time
3. User fills out booking form
4. User submits booking

### After (New Flow)
1. User visits booking page
2. User selects a date and time
3. **NEW**: System checks if user is authenticated
4. **NEW**: If not authenticated, redirects to `/auth` with return URL
5. **NEW**: User creates account or signs in
6. **NEW**: System automatically logs in user and returns to booking page
7. User fills out booking form (now authenticated)
8. User submits booking

## Implementation Details

### Components Added

1. **`BookingAuth` Component** (`frontend/src/pages/external_page/_components/booking-auth.tsx`)
   - Handles both sign up and sign in forms
   - Toggle between sign up and sign in modes
   - Preserves return URL for navigation back to booking page
   - Auto-fills email after successful sign up

2. **`BookingAuthPage` Component** (`frontend/src/pages/external_page/booking-auth-page.tsx`)
   - Wrapper page for the booking authentication flow
   - Provides consistent layout with event details placeholder

### Components Modified

1. **`BookingCalendar` Component** (`frontend/src/pages/external_page/_components/booking-calendar.tsx`)
   - Added authentication checks before slot selection
   - Added authentication checks before proceeding to next step
   - Added notification banner for unauthenticated users
   - Preserves booking state during auth redirect

2. **`BookingForm` Component** (`frontend/src/pages/external_page/_components/booking-form.tsx`)
   - Added authentication check on component mount
   - Redirects to auth if not authenticated
   - Only renders form for authenticated users

### Routes Added

- **`/auth`** - New authentication page for booking flow
- Added to `PUBLIC_ROUTES` in route configuration

### Store Updates

- Updated `UserType` to include `id` field to match API response

## Key Features

### State Preservation
- Selected date and time are preserved during authentication flow
- Return URL is encoded and passed to auth page
- User returns to exact same booking state after authentication

### User Experience
- Clear notification that account creation is required
- Seamless toggle between sign up and sign in
- Auto-fill email after successful sign up
- Consistent UI/UX with existing design

### Security
- Only authenticated users can access booking form
- Authentication state is checked at multiple points
- Secure token-based authentication

## Technical Implementation

### Authentication Checks
```typescript
// Check if user is authenticated
if (!accessToken || !user) {
  // Redirect to auth with return URL
  const returnUrl = location.pathname + location.search;
  navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  return;
}
```

### Return URL Handling
```typescript
// Get the return URL from search params
const returnUrl = searchParams.get("returnUrl") || "/";

// Navigate back to the booking page with preserved state
navigate(returnUrl);
```

### State Management
- Uses Zustand store for authentication state
- Persists authentication data in localStorage
- Automatic token expiration handling

## Error Handling

- Graceful handling of authentication failures
- Clear error messages for users
- Fallback navigation if return URL is invalid

## Testing Scenarios

1. **Unauthenticated User Flow**
   - User selects date → Redirected to auth → Creates account → Returns to booking

2. **Existing User Flow**
   - User selects date → Redirected to auth → Signs in → Returns to booking

3. **Direct Form Access**
   - User tries to access booking form directly → Redirected to auth

4. **State Preservation**
   - Selected date/time preserved through auth flow
   - Form data maintained after authentication

## Future Enhancements

1. **Social Authentication**
   - Google, Facebook, or other OAuth providers

2. **Guest Booking Option**
   - Allow limited bookings without full account creation

3. **Email Verification**
   - Require email verification before booking completion

4. **Remember Me**
   - Extended session duration for returning users

## Files Modified

- `frontend/src/pages/external_page/_components/booking-calendar.tsx`
- `frontend/src/pages/external_page/_components/booking-form.tsx`
- `frontend/src/pages/external_page/_components/booking-auth.tsx` (new)
- `frontend/src/pages/external_page/booking-auth-page.tsx` (new)
- `frontend/src/routes/common/routePaths.tsx`
- `frontend/src/routes/common/routes.tsx`
- `frontend/src/store/store.ts`

## API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /meeting/public/create` - Booking submission (existing)

## Security Considerations

1. **Token Validation**
   - JWT tokens are validated on each request
   - Automatic token refresh handling

2. **Route Protection**
   - Authentication checks at multiple points
   - Redirect loops prevented

3. **Data Validation**
   - Form validation on both client and server
   - Input sanitization

4. **Session Management**
   - Secure token storage
   - Automatic logout on token expiration 