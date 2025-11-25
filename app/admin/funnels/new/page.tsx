"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "basic" | "infusionsoft" | "webinarfuel" | "generate" | "review";

export default function NewFunnelPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [funnelData, setFunnelData] = useState({
    name: "",
    slug: "",
    infusionsoftCode: "",
    webinarfuelCode: "",
    webinarfuelUrl: "",
  });

  const [generatedPages, setGeneratedPages] = useState({
    registrationHtml: "",
    confirmationHtml: "",
  });

  const steps: { id: Step; title: string; description: string }[] = [
    { id: "basic", title: "Basic Info", description: "Name and URL slug" },
    { id: "infusionsoft", title: "Infusionsoft", description: "Paste form code" },
    { id: "webinarfuel", title: "WebinarFuel", description: "Paste widget code" },
    { id: "generate", title: "Generate", description: "AI creates pages" },
    { id: "review", title: "Review", description: "Preview and publish" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFunnelData({
      ...funnelData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleNext = async () => {
    setError("");
    
    if (currentStep === "basic") {
      if (!funnelData.name || !funnelData.slug) {
        setError("Please enter a funnel name");
        return;
      }
      setCurrentStep("infusionsoft");
    } else if (currentStep === "infusionsoft") {
      if (!funnelData.infusionsoftCode) {
        setError("Please paste your Infusionsoft form code");
        return;
      }
      setCurrentStep("webinarfuel");
    } else if (currentStep === "webinarfuel") {
      if (!funnelData.webinarfuelCode) {
        setError("Please paste your WebinarFuel widget code");
        return;
      }
      setCurrentStep("generate");
    } else if (currentStep === "generate") {
      await generatePages();
    } else if (currentStep === "review") {
      await publishFunnel();
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["basic", "infusionsoft", "webinarfuel", "generate", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const generatePages = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: funnelData.name,
          infusionsoftCode: funnelData.infusionsoftCode,
          webinarfuelCode: funnelData.webinarfuelCode,
          webinarfuelUrl: funnelData.webinarfuelUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate pages");
      }

      const data = await response.json();
      setGeneratedPages({
        registrationHtml: data.registrationPage,
        confirmationHtml: data.confirmationPage,
      });
      setCurrentStep("review");
    } catch (err: any) {
      setError(err.message || "Failed to generate pages");
    } finally {
      setLoading(false);
    }
  };

  const publishFunnel = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: funnelData.slug,
          name: funnelData.name,
          status: "active",
          infusionsoft_form_html: funnelData.infusionsoftCode,
          webinarfuel_widget_html: funnelData.webinarfuelCode,
          registration_page_html: generatedPages.registrationHtml,
          confirmation_page_html: generatedPages.confirmationHtml,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create funnel");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to create funnel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center mb-8">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`relative ${
                index !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
              }`}
            >
              {index !== steps.length - 1 && (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div
                    className={`h-0.5 w-full ${
                      index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
              <div className="relative flex items-center">
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index < currentStepIndex
                      ? "bg-blue-600 text-white"
                      : index === currentStepIndex
                      ? "bg-blue-600 text-white border-2 border-blue-600"
                      : "bg-white text-gray-400 border-2 border-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-900 hidden sm:block">
                  {step.title}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {steps[currentStepIndex].title}
        </h2>
        <p className="text-gray-600 mb-6">{steps[currentStepIndex].description}</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Info Step */}
        {currentStep === "basic" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funnel Name
              </label>
              <input
                type="text"
                value={funnelData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Income Stacking Webinar"
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
                  value={funnelData.slug}
                  onChange={(e) =>
                    setFunnelData({ ...funnelData, slug: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="income-stacking"
                />
              </div>
            </div>
          </div>
        )}

        {/* Infusionsoft Step */}
        {currentStep === "infusionsoft" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infusionsoft Form Code
            </label>
            <textarea
              value={funnelData.infusionsoftCode}
              onChange={(e) =>
                setFunnelData({ ...funnelData, infusionsoftCode: e.target.value })
              }
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="<form method='POST' action='https://...'>"
            />
            <p className="mt-2 text-sm text-gray-500">
              Paste the complete HTML form code from Infusionsoft
            </p>
          </div>
        )}

        {/* WebinarFuel Step */}
        {currentStep === "webinarfuel" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WebinarFuel Widget Code
              </label>
              <textarea
                value={funnelData.webinarfuelCode}
                onChange={(e) =>
                  setFunnelData({ ...funnelData, webinarfuelCode: e.target.value })
                }
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<script src='https://app.webinarfuel.com/...'>"
              />
              <p className="mt-2 text-sm text-gray-500">
                Paste the widget embed code from WebinarFuel
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WebinarFuel URL (Optional)
              </label>
              <input
                type="text"
                value={funnelData.webinarfuelUrl}
                onChange={(e) =>
                  setFunnelData({ ...funnelData, webinarfuelUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://app.webinarfuel.com/register/..."
              />
              <p className="mt-2 text-sm text-gray-500">
                If the widget code doesn't contain the full URL, paste it here
              </p>
            </div>
          </div>
        )}

        {/* Generate Step */}
        {currentStep === "generate" && (
          <div className="text-center py-8">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Generating Your Pages...
                </p>
                <p className="text-gray-600">
                  Claude AI is creating your registration and confirmation pages
                </p>
              </>
            ) : (
              <>
                <svg
                  className="mx-auto h-16 w-16 text-blue-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Generate
                </p>
                <p className="text-gray-600">
                  Click continue to have AI create your funnel pages
                </p>
              </>
            )}
          </div>
        )}

        {/* Review Step */}
        {currentStep === "review" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Registration Page Preview</h3>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-64 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {generatedPages.registrationHtml.substring(0, 500)}...
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Confirmation Page Preview</h3>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-64 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {generatedPages.confirmationHtml.substring(0, 500)}...
                </pre>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                Your funnel will be published to:{" "}
                <strong>learn.thecashflowacademy.com/{funnelData.slug}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === "basic" || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : currentStep === "review"
              ? "Publish Funnel"
              : currentStep === "generate"
              ? "Generate Pages"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
