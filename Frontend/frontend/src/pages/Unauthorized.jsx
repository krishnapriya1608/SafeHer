import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import verifyImage from "../assets/Girlyimg.png";
import { dashboardPathForRole } from "../utils/roles";

export default function Unauthorized() {
  const { role } = useAuth();

  return (
    <AuthLayout
      eyebrow="Access denied"
      title="This area is restricted"
      subtitle="Your current role does not have permission to open this dashboard."
      image={verifyImage}
    >      <Link className="btn-primary w-full" to={dashboardPathForRole(role)}>
        Go to my dashboard
      </Link>
    </AuthLayout>
  );
}
