'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const cid = searchParams.get('cid');
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

  useEffect(() => {
    // Load WebinarFuel confirmation widget
    const script = document.createElement('script');
    script.src = 'https://d3pw37i36t41cq.cloudfront.net/embed_v2.js';
    script.async = true;
    script.onload = () => {
      setIsWidgetLoaded(true);
      
      // Initialize widget
      (window as unknown as { _wf?: unknown[] })._wf = (window as unknown as { _wf?: unknown[] })._wf || [];
      (window as unknown as { _wf: unknown[] })._wf.push({
        id: 'xCo1kQcuJZKwRwTTXcySfXJc',
        forwardCid: true
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="d3pw37i36t41cq.cloudfront.net"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">The Cash Flow Academy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">✓</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                🎉 You&apos;re Registered!
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Your spot for the Income Stacking masterclass has been secured.
              </p>
              {cid && (
                <p className="text-sm text-gray-500">
                  Confirmation ID: {cid}
                </p>
              )}
            </div>
          </div>

          {/* What Happens Next */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📧</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 text-sm">
                    We&apos;ve sent you a confirmation email with your webinar access link and calendar invite. 
                    Please check your inbox (and spam folder).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📱</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Save the Date</h3>
                  <p className="text-gray-600 text-sm">
                    Add the webinar to your calendar and set a reminder. This training happens live 
                    at 7:00 PM EST on Tuesdays and Saturdays.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Come Prepared</h3>
                  <p className="text-gray-600 text-sm">
                    Bring a notepad and be ready to learn Andy&apos;s proven income stacking strategies. 
                    This will be an interactive session with live Q&A.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎁</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Bonus Materials</h3>
                  <p className="text-gray-600 text-sm">
                    All attendees will receive exclusive bonus materials and resources 
                    to help you implement the income stacking strategies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WebinarFuel Widget */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Webinar Details
              </h2>
              <p className="text-gray-600">
                Complete information about your upcoming session
              </p>
            </div>
            
            {/* Widget Container */}
            <div className="flex justify-center">
              {!isWidgetLoaded && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                  <span className="text-gray-600">Loading webinar details...</span>
                </div>
              )}
              <div className="wf_target wf_target_xCo1kQcuJZKwRwTTXcySfXJc"></div>
            </div>
          </div>

          {/* Additional Support */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions or issues accessing the webinar, our support team is here to help.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 Email: support@thecashflowacademy.com</p>
                <p>💬 Live chat available on our website</p>
              </div>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Know someone who could benefit from learning about income stacking?
            </p>
            <p className="text-sm text-gray-500">
              Share this opportunity with friends and family who want to build wealth through investing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            © 2025 The Cash Flow Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}