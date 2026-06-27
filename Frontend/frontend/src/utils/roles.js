export const roles = [
  {
    value: "user",
    label: "User",
    description: "Create SOS alerts, manage contacts, and view your safety status.",
  },
  {
    value: "volunteer",
    label: "Volunteer",
    description: "Receive nearby SOS requests and respond quickly.",
  },
  {
    value: "police",
    label: "Police",
    description: "Track live emergency cases and coordinate response.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage users, reports, volunteers, and SOS records.",
  },
];

export function dashboardPathForRole(role) {
  const paths = {
    user: "/dashboard/user",
    volunteer: "/dashboard/volunteer",
    police: "/dashboard/police",
    admin: "/dashboard/admin",
  };

  return paths[role] || paths.user;
}
