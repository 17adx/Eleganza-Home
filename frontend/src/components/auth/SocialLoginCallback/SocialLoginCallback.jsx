import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../api/auth";
import useAuth from "../../../hooks/useAuth";

const SocialLoginCallback = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const fetchJWT = async () => {
      try {
        const response = await auth.socialLoginJwt();
        const { access, refresh, is_seller } = response.data;

        if (is_seller) {
          alert(
            "🚫 Google login is only allowed for regular users, not sellers."
          );
          navigate("/login");
          return;
        }

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        await refreshUser();

        navigate("/profile");
      } catch (error) {
        console.error("User cancelled or login failed.", error);
        navigate("/login");
      }
    };

    fetchJWT();
  }, [navigate, refreshUser]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.5rem",
      }}
    >
      Logging you in...
    </div>
  );
};

export default SocialLoginCallback;