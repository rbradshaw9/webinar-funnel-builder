import { notFound } from "next/navigation";
import { getFunnelBySlug, incrementFunnelViews } from "@/lib/db";

export default async function FunnelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const funnel = await getFunnelBySlug(slug);

  if (!funnel) {
    notFound();
  }

  if (funnel.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Funnel Not Available
          </h1>
          <p className="text-gray-600">This funnel is currently not active.</p>
        </div>
      </div>
    );
  }

  // Check if pages have been generated
  if (!funnel.registration_page_html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Funnel Not Ready
          </h1>
          <p className="text-gray-600 mb-4">
            This funnel hasn't been generated yet. Please complete the setup in the admin dashboard.
          </p>
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Track view
  await incrementFunnelViews(funnel.id);

  // Render the generated HTML
  return (
    <div
      dangerouslySetInnerHTML={{ __html: funnel.registration_page_html }}
    />
  );
}
