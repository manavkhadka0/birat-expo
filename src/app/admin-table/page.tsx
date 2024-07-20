import AdminTable from "@/components/admin-table";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-gray-800 py-10">
        Admin Dashboard
      </h1>
      <AdminTable />
    </div>
  );
}
