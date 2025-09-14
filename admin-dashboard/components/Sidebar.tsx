import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar: React.FC = () => {
  const router = useRouter();
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul>
        <li className={router.pathname === '/dashboard/reports' ? 'active' : ''}>
          <Link href="/dashboard/reports">Hazard Reports</Link>
        </li>
        <li className={router.pathname === '/dashboard/analytics' ? 'active' : ''}>
          <Link href="/dashboard/analytics">Analytics</Link>
        </li>
        <li>
        <a href="/dashboard/user-management">User Management</a>
        </li>
        <li>
  <Link href="/dashboard/help-me">Help-Me Submissions</Link>
</li>

      </ul>
    </div>
  );
};

export default Sidebar;
