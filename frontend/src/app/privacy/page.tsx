"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  User,
  CreditCard,
  FileText,
  BarChart3,
  Cookie,
  Database,
  Share2,
  Lock,
  UserCheck,
  Baby,
  ExternalLink,
  RefreshCw,
  Mail
} from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction", icon: Shield },
  { id: "information", title: "Information We Collect", icon: User },
  { id: "cookies", title: "Cookies & Analytics", icon: Cookie },
  { id: "usage", title: "How We Use Your Info", icon: BarChart3 },
  { id: "retention", title: "Data Retention", icon: Database },
  { id: "sharing", title: "Sharing of Information", icon: Share2 },
  { id: "security", title: "Data Security", icon: Lock },
  { id: "rights", title: "Your Privacy Rights", icon: UserCheck },
  { id: "children", title: "Children's Privacy", icon: Baby },
  { id: "links", title: "Third-Party Links", icon: ExternalLink },
  { id: "changes", title: "Policy Changes", icon: RefreshCw },
  { id: "contact", title: "Contact Us", icon: Mail },
];

export default function PrivacyPolicyPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your privacy matters to us. Learn how CalcnConvert collects, uses, and protects your information.
            </p>
            <p className="text-gray-500 text-sm mt-4">Last updated: December 25, 2025</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Contents</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-left"
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Section 1 */}
              <section id="introduction" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to CalcnConvert. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-700 text-sm">
                    By accessing or using CalcnConvert, you agree to the practices described in this Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="information" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">Personal Information</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">When you create an account, we may collect:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Name", "Email address", "Login credentials", "Subscription details"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">Payment Information</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Payments are processed by Stripe. We do not store your credit card or banking details.
                    </p>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">Uploaded Files</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Files uploaded for conversion are deleted immediately after processing and are never stored. We do not access your files except as required to operate the Service or comply with legal obligations.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">Automatically Collected</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["IP address", "Device type", "Browser", "OS", "Usage patterns"].map((item) => (
                        <span key={item} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="cookies" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Cookie className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">3. Cookies, Analytics & Advertising</h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Cookies</h3>
                    <p className="text-gray-600 text-sm">Used for sessions, preferences, and site functionality.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Analytics</h3>
                    <p className="text-gray-600 text-sm">We use analytics tools to understand user interactions.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Advertising</h3>
                    <p className="text-gray-600 text-sm">Third-party ads may use cookies for relevant content.</p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="usage" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">4. How We Use Your Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Create and manage accounts",
                    "Provide conversion services",
                    "Process payments",
                    "Improve features",
                    "Monitor for fraud",
                    "Send service updates"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-medium">
                        {i + 1}
                      </div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 5 */}
              <section id="retention" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Database className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">5. Data Retention</h2>
                </div>
                <p className="text-gray-600">
                  We retain personal information only as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account and associated data at any time.
                </p>
              </section>

              {/* Section 6 */}
              <section id="sharing" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Share2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">6. Sharing of Information</h2>
                </div>

                <p className="text-gray-600 mb-3">We may share information only with:</p>
                <ul className="text-gray-600 space-y-1 mb-4 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    Payment processors (e.g., Stripe)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    Analytics and advertising providers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    Cloud hosting and infrastructure providers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    Legal authorities when required by law
                  </li>
                </ul>
                <p className="text-gray-600 font-medium">
                  We do not sell your personal information.
                </p>
              </section>

              {/* Section 7 */}
              <section id="security" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">7. Data Security</h2>
                </div>
                <p className="text-gray-600">
                  We use reasonable administrative, technical, and organizational safeguards to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Section 8 */}
              <section id="rights" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">8. Your Privacy Rights</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Access your personal data",
                    "Request correction or deletion",
                    "Opt out of marketing",
                    "Restrict processing"
                  ].map((right) => (
                    <div key={right} className="flex items-center gap-2 text-gray-700">
                      <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">{right}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 9 */}
              <section id="children" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Baby className="w-5 h-5 text-pink-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">9. Children&apos;s Privacy</h2>
                </div>
                <p className="text-gray-600">
                  CalcnConvert is not intended for children under 13. We do not knowingly collect personal information from children.
                </p>
              </section>

              {/* Section 10 */}
              <section id="links" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <ExternalLink className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">10. Third-Party Links</h2>
                </div>
                <p className="text-gray-600">
                  Our Service may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.
                </p>
              </section>

              {/* Section 11 */}
              <section id="changes" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">11. Changes to This Policy</h2>
                </div>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.
                </p>
              </section>

              {/* Section 12 */}
              <section id="contact" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">12. Contact Us</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, contact us at:
                </p>
                <div className="text-gray-600 space-y-2">
                  <p>
                    <span className="font-medium text-gray-900">Support:</span>{" "}
                    <a href="mailto:support@calcnconvert.net" className="text-red-500 hover:text-red-600">
                      support@calcnconvert.net
                    </a>
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">General Enquiries:</span>{" "}
                    <a href="mailto:info@calcnconvert.net" className="text-red-500 hover:text-red-600">
                      info@calcnconvert.net
                    </a>
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Website:</span>{" "}
                    <a href="https://calcnconvert.net" className="text-red-500 hover:text-red-600">
                      https://calcnconvert.net
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
