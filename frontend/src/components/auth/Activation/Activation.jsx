import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { auth } from "../../../api/auth";
import useAuth from "../../../hooks/useAuth";

const Activation = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await auth.activate(uid, token);
        const { access, refresh } = response.data;

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        const userResponse = await auth.profileMe();
        setUser(userResponse.data);

        await Swal.fire(
          "Success",
          "Your account is activated and logged in!",
          "success"
        );

        navigate("/profile");
      } catch (error) {
        console.error("Account activation failed:", error);

        const message =
          error.response?.data?.detail ||
          "Something went wrong.";

        Swal.fire("Error", message, "error");
      } finally {
        setLoading(false);
      }
    };

    activateAccount();
  }, [uid, token, setUser, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {loading ? "Activating your account..." : null}
    </div>
  );
};

export default Activation;