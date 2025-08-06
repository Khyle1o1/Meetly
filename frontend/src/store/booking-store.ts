import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import createSelectors from "./selectors";

type BookingUserType = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
};

type BookingAuthState = {
  bookingUser: BookingUserType | null;
  bookingToken: string | null;
  bookingExpiresAt: number | null;

  setBookingUser: (user: BookingUserType | null) => void;
  setBookingToken: (token: string | null) => void;
  setBookingExpiresAt: (expiresAt: number | null) => void;

  clearBookingUser: () => void;
  clearBookingToken: () => void;
  clearBookingExpiresAt: () => void;
  clearBookingAuth: () => void;
};

const createBookingAuthSlice: StateCreator<BookingAuthState> = (set) => ({
  bookingUser: null,
  bookingToken: null,
  bookingExpiresAt: null,

  setBookingToken: (token) => set({ bookingToken: token }),
  setBookingExpiresAt: (expiresAt: number | null) => set({ bookingExpiresAt: expiresAt }),
  setBookingUser: (user) => set({ bookingUser: user }),

  clearBookingUser: () => set({ bookingUser: null }),
  clearBookingToken: () => set({ bookingToken: null }),
  clearBookingExpiresAt: () => set({ bookingExpiresAt: null }),
  clearBookingAuth: () => set({ 
    bookingUser: null, 
    bookingToken: null, 
    bookingExpiresAt: null 
  }),
});

type BookingStoreType = BookingAuthState;

export const useBookingStoreBase = create<BookingStoreType>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createBookingAuthSlice(...a),
      })),
      {
        name: "booking-storage",
        storage: {
          getItem: (name) => {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
      }
    )
  )
);

export const useBookingStore = createSelectors(useBookingStoreBase); 