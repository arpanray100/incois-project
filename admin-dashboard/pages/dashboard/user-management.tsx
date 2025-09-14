import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Check token on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) setIsLoggedIn(true);
    }
  }, []);

  // Fetch users only if logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setFetchError(false);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          setFetchError(true);
          setIsLoggedIn(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
        else setFetchError(true);
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn]);

  // Handle admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
      } else {
        setLoginError(true);
      }
    } catch (err) {
      console.error(err);
      setLoginError(true);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {loginError && <p style={{ color: 'red' }}>Login failed. Check credentials.</p>}
      </div>
    );
  }

  // Dashboard UI
  return (
    <>
      <Sidebar />
      <Topbar />
      <div className="dashboard-content">
        <h2>User Management</h2>

        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && fetchError && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Unable to load users.
                </td>
              </tr>
            )}
            {!loading && !fetchError && users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              !fetchError &&
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive === undefined ? 'N/A' : user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .dashboard-content {
          padding: 20px;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        .users-table th,
        .users-table td {
          padding: 10px;
          border: 1px solid #ccc;
          text-align: left;
        }
        .login-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .login-page input {
          display: block;
          margin: 10px 0;
          padding: 8px;
          width: 250px;
        }
        .login-page button {
          padding: 8px 20px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default UserManagement;
