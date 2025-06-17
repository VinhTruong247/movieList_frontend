import { useSelector, useDispatch } from "react-redux";
import { signOut } from "../redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  const logout = async (navigate) => {
    try {
      const result = await dispatch(signOut()).unwrap();
      if (result.success && navigate) {
        navigate("/login");
      }

      return result;
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error };
    }
  };

  return {
    currentUser,
    loading,
    error,
    isAdmin: currentUser?.role === "admin",
    isAuthenticated: !!currentUser,
    logout,
  };
};
