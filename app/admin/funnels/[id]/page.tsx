"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditFunnelPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const funnelId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [funnel, setFunnel] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "active" as "active" | "draft" | "paused",
  });

  useEffect(() => {
    loadFunnel();
  }, [funnelId]);

  const loadFunnel = async () => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}`);
      if (!response.ok) throw new Error("Funnel not found");

      const data = await response.json();
      setFunnel(data.funnel);
      setFormData({
        name: data.funnel.name,
        slug: data.funnel.slug,
        status: data.funnel.status,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load funnel");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update funnel");

      setSuccess("Funnel updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update funnel");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm("Generate or regenerate pages for this funnel? This may take 1-2 minutes.")) {
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId: parseInt(funnelId) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate pages");
      }

      const data = await response.json();
      setSuccess("Pages generated successfully!");
      
      // Reload funnel to show the new pages
      await loadFunnel();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to generate pages");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Funnel Not Found</h2>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Funnel</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funnel Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-2">
                  learn.thecashflowacademy.com/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "draft" | "paused",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {funnel.total_views}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {funnel.total_submissions}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {typeof funnel.conversion_rate === 'number' ? funnel.conversion_rate.toFixed(2) : '0.00'}%
              </p>
            </div>
          </div>
        </div>

        {/* Pages */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pages</h2>
          {!funnel.registration_page_html || !funnel.confirmation_page_html ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800 mb-3">
                {!funnel.registration_page_html && !funnel.confirmation_page_html
                  ? "No pages have been generated yet."
                  : "Some pages are missing. Generate to create all pages."}
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? "Generating... (1-2 min)" : "Generate Pages"}
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <Link
                href={`/${funnel.slug}`}
                target="_blank"
                className="block text-blue-600 hover:text-blue-800"
              >
                Registration Page →
              </Link>
              <Link
                href={`/${funnel.slug}/confirmation`}
                target="_blank"
                className="block text-blue-600 hover:text-blue-800"
              >
                Confirmation Page →
              </Link>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Regenerating..." : "Regenerate Pages"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
