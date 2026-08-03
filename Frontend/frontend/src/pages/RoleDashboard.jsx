import UserLayout from "../components/dashboards/UserLayout";
import VolunteerLayout from "../components/dashboards/VolunteerLayout";


export default function RoleDashboard({ roleName }) {
    console.log("RoleDashboard:", roleName);

  switch (roleName) {
    case "user":
      return <UserLayout  roleName={roleName} />;

    case "volunteer":
      return <VolunteerLayout />;

    // case "police":
    //   return <PoliceLayout />;

    // case "admin":
    //   return <AdminLayout />;

    default:
      return <UserLayout />;
  }
}