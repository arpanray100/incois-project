// pages/dashboard/help-me.tsx
import { useEffect, useState } from "react";

export default function HelpMeReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/help-me/submissions");
        const json = await res.json();

        if (Array.isArray(json)) {
          setData(json);
        } else if (json.data && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setError("Invalid API response");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center p-6 text-gray-600 dark:text-gray-300">Loading...</p>;
  if (error) return <p className="text-center p-6 text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 text-center">
        📋 Help Me Submissions
      </h1>

      {data.length === 0 ? (
        <p className="text-center text-gray-700 dark:text-gray-400 text-lg">
          No submissions found.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry: any, index: number) => (
                <tr
                  key={entry._id || index}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {entry._id}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        entry.type === "resource"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {entry.name || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {entry.location || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-300">
                    {entry.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
