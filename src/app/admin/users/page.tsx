'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      alert('Error fetching users: ' + error.message);
      setLoading(false);
      return;
    }
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(userId: string, newRole: string) {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) {
      alert('Error updating role: ' + error.message);
    } else {
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    }
  }

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2 text-left">Rol</th>
            <th className="border border-gray-300 p-2 text-left">Kayıt Tarihi</th>
            <th className="border border-gray-300 p-2 text-left">Rol Değiştir</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="odd:bg-gray-50">
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">{user.role}</td>
              <td className="border border-gray-300 p-2">
                {new Date(user.created_at).toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2">
                <select
                  value={user.role}
                  onChange={e => updateRole(user.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
