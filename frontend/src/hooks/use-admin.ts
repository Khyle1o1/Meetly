import { useStore } from "@/store/store";

export const useAdmin = () => {
  const { user } = useStore();
  
  const isAdmin = user?.role === "admin";
  
  return {
    isAdmin,
    user,
  };
}; 