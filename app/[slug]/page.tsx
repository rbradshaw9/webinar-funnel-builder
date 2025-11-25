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

  // Track view
  await incrementFunnelViews(funnel.id);

  // Render the generated HTML
  return (
    <div
      dangerouslySetInnerHTML={{ __html: funnel.registration_page_html || "" }}
    />
  );
}
