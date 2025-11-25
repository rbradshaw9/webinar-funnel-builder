"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MigratePage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/migrate");
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || "Failed to check migration status");
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    try {
      setRunning(true);
      setError("");
      setSuccess("");
      
      const response = await fetch("/api/migrate", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Migration completed successfully!");
        setStatus(data);
      } else {
        setError(data.error || "Failed to run migration");
      }
    } catch (err: any) {
      setError(err.message || "Failed to run migration");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Database Migration
            </h1>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Checking migration status...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800">{success}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Migration Status
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Status:
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {status?.columnExists ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Migration Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠ Migration Needed
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Message:
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {status?.message}
                        </dd>
                      </div>
                      {status?.details && status.details.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Column Details:
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <pre className="bg-white p-2 rounded border text-xs">
                              {JSON.stringify(status.details, null, 2)}
                            </pre>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    What this migration does:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Adds <code className="bg-blue-100 px-1 py-0.5 rounded">confirmation_widget_code</code> column to funnels table</li>
                    <li>• Allows storing WebinarFuel widget code for confirmation pages</li>
                    <li>• Safe to run multiple times (uses IF NOT EXISTS)</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  {!status?.columnExists && (
                    <button
                      onClick={runMigration}
                      disabled={running}
                      className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        running
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {running ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⟳</span>
                          Running Migration...
                        </>
                      ) : (
                        "Run Migration"
                      )}
                    </button>
                  )}

                  <button
                    onClick={checkStatus}
                    disabled={running}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh Status
                  </button>

                  <button
                    onClick={() => router.push("/admin")}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
