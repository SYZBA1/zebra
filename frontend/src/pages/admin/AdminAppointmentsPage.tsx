import AdminAppointments from "@/pages/AdminAppointments";

// Reuse existing appointments page within new layout
export default function AdminAppointmentsPage() {
  return (
    <div className="-m-6">
      <AdminAppointments />
    </div>
  );
}
