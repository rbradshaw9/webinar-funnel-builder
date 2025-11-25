"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Funnel } from "@/lib/db";

export default function AdminPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      const response = await fetch("/api/funnels");
      const data = await response.json();
      setFunnels(data.funnels || []);
    } catch (error) {
      console.error("Error loading funnels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this funnel?")) return;

    try {
      await fetch(`/api/funnels/${id}`, { method: "DELETE" });
      loadFunnels();
    } catch (error) {
      console.error("Error deleting funnel:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Funnels</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your webinar registration funnels
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/funnels/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Funnel
          </Link>
        </div>
      </div>

      {funnels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No funnels</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first funnel
          </p>
          <div className="mt-6">
            <Link
              href="/admin/funnels/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Funnel
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {funnels.map((funnel) => (
            <div
              key={funnel.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {funnel.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      funnel.status === "active"
                        ? "bg-green-100 text-green-800"
                        : funnel.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {funnel.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500 space-y-2">
                  <div className="flex justify-between">
                    <span>Slug:</span>
                    <span className="font-mono text-blue-600">/{funnel.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span className="font-semibold">{funnel.total_views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submissions:</span>
                    <span className="font-semibold">{funnel.total_submissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion:</span>
                    <span className="font-semibold text-green-600">
                      {funnel.conversion_rate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                {funnel.status === "draft" && !funnel.registration_page_html ? (
                  <Link
                    href={`/admin/funnels/new?draft=${funnel.id}`}
                    className="text-sm font-medium text-orange-600 hover:text-orange-500"
                  >
                    ✏️ Continue Setup
                  </Link>
                ) : (
                  <Link
                    href={`/admin/funnels/${funnel.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </Link>
                )}
                <div className="flex space-x-3">
                  {funnel.status === "active" && (
                    <Link
                      href={`/${funnel.slug}`}
                      target="_blank"
                      className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                      Preview
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(funnel.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
