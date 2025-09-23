'use client';

import { useRouter } from 'next/navigation';
import RegistrationForm from '@/components/RegistrationForm';

export default function HomePage() {
  const router = useRouter();

  const handleRegistrationSuccess = (cid?: string) => {
    // Redirect to confirmation page with CID
    const params = new URLSearchParams();
    if (cid) params.append('cid', cid);
    router.push(`/confirmation?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">The Cash Flow Academy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Copy */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  MAXIMIZE YOUR INVESTMENTS WITH{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    INCOME STACKING
                  </span>
                </h1>
                
                <p className="text-xl text-gray-700 mb-8">
                  Unlock the power of Cash Flow Stocks and discover how to generate 
                  multiple income streams from a single stock.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Step-by-Step Blueprint:</strong> Access proven methods Andy has shared with thousands of investors worldwide.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Time-Tested Strategies:</strong> Perfect for anyone looking to build wealth—even if you feel behind.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Boost Your Confidence:</strong> Learn how to take control of your financial future with clear, actionable steps.
                  </p>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xl">🌟</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Join Rich Dad Expert Andy Tanner</h3>
                    <p className="text-sm text-gray-600">Noted Author, Speaker, Teacher, and Long-time Rich Dad Expert</p>
                  </div>
                </div>
                
                <blockquote className="text-sm text-gray-700 italic">
                  &ldquo;Andy&apos;s teaching style is fantastic. With Andy you will definitely be able to learn to invest for cash flow with confidence.&rdquo;
                  <footer className="mt-2 text-xs text-gray-600">— Justin O&apos;Keefe</footer>
                </blockquote>
              </div>

              {/* Urgency */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <p className="text-red-800 font-medium">
                    Limited Spots Available - Don&apos;t Miss Out!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Register for FREE Training
                  </h2>
                  <p className="text-gray-600">
                    Secure your spot for the next session
                  </p>
                </div>
                
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Signals Footer */}
      <footer className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>Mobile Optimized</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Instant Access</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            © 2025 The Cash Flow Academy. This training is for educational purposes only. 
            We are not providing financial advisory services. All investing involves risk.
          </p>
        </div>
      </footer>
    </div>
  );
}