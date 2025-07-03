import BackToDashboardButton from "./components/ui/BackToDashboardButton";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <BackToDashboardButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
