import Link from 'next/link';

type CardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

export default function DashboardCard({ title, description, href, icon }: CardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition max-w-xs mx-auto"
    >
      <div className="text-purple-600 mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-center">{description}</p>
    </Link>
  );
}
