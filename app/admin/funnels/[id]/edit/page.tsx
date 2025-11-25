"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Tab = "settings" | "content" | "ai-edit" | "code-edit";

export default function ComprehensiveEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const funnelId = params.id;

  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [funnel, setFunnel] = useState<any>(null);
  
  // Basic settings
  const [settings, setSettings] = useState({
    name: "",
    slug: "",
    status: "active" as "active" | "draft" | "paused",
  });

  // Content fields
  const [content, setContent] = useState({
    webinarTitle: "",
    webinarDescription: "",
    targetAudience: "",
    mainBenefits: "",
    socialProof: "",
    hostInfo: "",
    urgency: "",
    referenceUrl: "",
    additionalNotes: "",
    confirmationWidgetCode: "",
  });

  // AI editing
  const [aiPrompt, setAiPrompt] = useState("");
  const [editingPage, setEditingPage] = useState<"registration" | "confirmation">("registration");

  // Manual code editing
  const [regHtml, setRegHtml] = useState("");
  const [confHtml, setConfHtml] = useState("");

  useEffect(() => {
    loadFunnel();
  }, [funnelId]);

  const loadFunnel = async () => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}`);
      if (!response.ok) throw new Error("Funnel not found");

      const data = await response.json();
      const f = data.funnel;
      setFunnel(f);
      
      setSettings({
        name: f.name,
        slug: f.slug,
        status: f.status,
      });

      setContent({
        webinarTitle: f.webinar_title || "",
        webinarDescription: f.webinar_description || "",
        targetAudience: f.target_audience || "",
        mainBenefits: f.main_benefits || "",
        socialProof: f.social_proof || "",
        hostInfo: f.host_info || "",
        urgency: f.urgency || "",
        referenceUrl: f.reference_url || "",
        additionalNotes: f.additional_notes || "",
        confirmationWidgetCode: f.confirmation_widget_code || "",
      });

      setRegHtml(f.registration_page_html || "");
      setConfHtml(f.confirmation_page_html || "");
    } catch (err: any) {
      setError(err.message || "Failed to load funnel");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setSuccess("Settings saved!");
      setTimeout(() => setSuccess(""), 3000);
      await loadFunnel();
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/funnels/${funnelId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) throw new Error("Failed to update content");

      setSuccess("Content saved!");
      setTimeout(() => setSuccess(""), 3000);
      await loadFunnel();
    } catch (err: any) {
      setError(err.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate pages from scratch? This will overwrite your current pages. Takes 1-2 minutes.")) {
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

      setSuccess("Pages regenerated successfully!");
      await loadFunnel();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate pages");
    } finally {
      setGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) {
      setError("Please enter instructions for the AI");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnelId: parseInt(funnelId),
          page: editingPage,
          prompt: aiPrompt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to apply AI edits");
      }

      setSuccess(`${editingPage === 'registration' ? 'Registration' : 'Confirmation'} page updated!`);
      setAiPrompt("");
      await loadFunnel();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to apply AI edits");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCode = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/funnels/${funnelId}/pages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationHtml: regHtml,
          confirmationHtml: confHtml,
        }),
      });

      if (!response.ok) throw new Error("Failed to save pages");

      setSuccess("Pages saved successfully!");
      await loadFunnel();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save pages");
    } finally {
      setSaving(false);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Funnel: {funnel.name}</h1>
          <div className="flex gap-2">
            <Link
              href={`/${funnel.slug}`}
              target="_blank"
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Preview Reg Page
            </Link>
            <Link
              href={`/${funnel.slug}/confirmation`}
              target="_blank"
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Preview Conf Page
            </Link>
          </div>
        </div>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "settings", label: "Settings" },
            { id: "content", label: "Content & Regenerate" },
            { id: "ai-edit", label: "AI Quick Edits" },
            { id: "code-edit", label: "Manual Code Editor" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funnel Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
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
                    value={settings.slug}
                    onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={settings.status}
                  onChange={(e) =>
                    setSettings({ ...settings, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{funnel.total_views}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{funnel.total_submissions}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {typeof funnel.conversion_rate === 'number' ? funnel.conversion_rate.toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Webinar Content</h2>
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {generating ? "Regenerating..." : "🔄 Regenerate All Pages"}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Edit these fields and click "Regenerate All Pages" to create new pages with updated content.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webinar Title
                </label>
                <input
                  type="text"
                  value={content.webinarTitle}
                  onChange={(e) => setContent({ ...content, webinarTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Master the 90% Win Rate Strategy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webinar Description
                </label>
                <textarea
                  value={content.webinarDescription}
                  onChange={(e) => setContent({ ...content, webinarDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="What will attendees learn?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={content.targetAudience}
                    onChange={(e) => setContent({ ...content, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Options traders, entrepreneurs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency/Scarcity
                  </label>
                  <input
                    type="text"
                    value={content.urgency}
                    onChange={(e) => setContent({ ...content, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Limited seats, last webinar this year"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Benefits (one per line)
                </label>
                <textarea
                  value={content.mainBenefits}
                  onChange={(e) => setContent({ ...content, mainBenefits: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Learn the 90% win rate strategy&#10;Generate consistent monthly income&#10;Reduce risk in your portfolio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Proof / Testimonials
                </label>
                <textarea
                  value={content.socialProof}
                  onChange={(e) => setContent({ ...content, socialProof: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Student testimonials, results, stats"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host Information
                </label>
                <textarea
                  value={content.hostInfo}
                  onChange={(e) => setContent({ ...content, hostInfo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Credentials, experience, achievements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference URL (for design inspiration)
                </label>
                <input
                  type="url"
                  value={content.referenceUrl}
                  onChange={(e) => setContent({ ...content, referenceUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/page-to-reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Page WebinarFuel Widget (optional)
                </label>
                <textarea
                  value={content.confirmationWidgetCode}
                  onChange={(e) => setContent({ ...content, confirmationWidgetCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  rows={4}
                  placeholder="<div data-webinarfuel-webinar=... (different widget for countdown/replay on confirmation page)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a different WebinarFuel widget code if you want a countdown timer or replay widget on the confirmation page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes / Special Instructions
                </label>
                <textarea
                  value={content.additionalNotes}
                  onChange={(e) => setContent({ ...content, additionalNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Any special design requests, specific wording, images to include, etc."
                />
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={handleSaveContent}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Content (No Regeneration)"}
              </button>
              <button
                onClick={async () => {
                  await handleSaveContent();
                  if (!error) {
                    setTimeout(() => handleRegenerate(), 500);
                  }
                }}
                disabled={saving || generating}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {generating ? "Regenerating... (1-2 min)" : "Save & Regenerate Pages"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "ai-edit" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">AI Quick Edits</h2>
            <p className="text-sm text-gray-600">
              Tell the AI what to change and it will update your page. For example: "Make the headline text darker" or "Change the button color to green" or "Add more spacing between sections"
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which page to edit?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="registration"
                    checked={editingPage === "registration"}
                    onChange={(e) => setEditingPage(e.target.value as any)}
                    className="mr-2"
                  />
                  Registration Page
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="confirmation"
                    checked={editingPage === "confirmation"}
                    onChange={(e) => setEditingPage(e.target.value as any)}
                    className="mr-2"
                  />
                  Confirmation Page
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to change?
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Examples:&#10;- Make all the body text darker for better contrast&#10;- Change the button color to a vibrant green&#10;- Add more spacing between the headline and the form&#10;- Make the headline bigger and bolder&#10;- Replace the background gradient with a solid dark blue&#10;- Center-align all text in the hero section"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for AI Edits:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Be specific about what you want to change</li>
                <li>Mention colors, sizes, alignments, spacing</li>
                <li>You can make multiple changes at once</li>
                <li>Takes 30-60 seconds to apply changes</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAiEdit}
                disabled={generating || !aiPrompt.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Applying Changes..." : "✨ Apply AI Edits"}
              </button>
            </div>

            {(funnel.registration_page_html || funnel.confirmation_page_html) && (
              <div className="pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview Current Page</h3>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={editingPage === "registration" ? funnel.registration_page_html : funnel.confirmation_page_html}
                    className="w-full h-96"
                    title="Page Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "code-edit" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Manual Code Editor</h2>
            <p className="text-sm text-gray-600">
              Edit the HTML directly. Be careful - incorrect HTML may break your pages.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Page HTML
              </label>
              <textarea
                value={regHtml}
                onChange={(e) => setRegHtml(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                rows={15}
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Page HTML
              </label>
              <textarea
                value={confHtml}
                onChange={(e) => setConfHtml(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"
                rows={15}
                spellCheck={false}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCode}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save HTML"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
