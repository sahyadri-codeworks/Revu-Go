"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link href="/login" className="inline-flex items-center gap-2 text-[13px] text-[#6B7280] hover:text-[#7C3AED] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <img src="/logo-name.png" alt="RevuGo" className="h-14 object-contain mix-blend-multiply" />
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 shadow-sm">
          <h1 className="text-[28px] font-bold text-[#111] mb-2">Privacy Policy</h1>
          <p className="text-[13px] text-[#9CA3AF] mb-8">Last updated: June 28, 2026</p>

          <div className="prose-legal space-y-8 text-[14px] text-[#374151] leading-[1.8]">
            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">1. Introduction</h2>
              <p>
                RevuGo (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the RevuGo platform, accessible at revu-go.vercel.app and related services. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="mt-2">
                By accessing or using RevuGo, you consent to the data practices described in this policy. If you do not agree, please discontinue use of the platform immediately.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">2. Information We Collect</h2>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Information:</strong> Name, email address, and password when you register a business account.</li>
                <li><strong>Business Information:</strong> Business name, address, category, description, services offered, staff information, logo, Google Maps URL, website, and social media links.</li>
                <li><strong>Campaign Data:</strong> Reward campaign details including offer descriptions, coupon codes, and expiry dates.</li>
                <li><strong>Customer Feedback:</strong> Star ratings, multiple-choice question responses, additional comments, and review text submitted by end-users through the review flow.</li>
                <li><strong>Complaint Information:</strong> Complaint details, contact information (name, email, phone) when voluntarily provided by customers, and consent preferences.</li>
                <li><strong>Payment Information:</strong> Billing details processed through our third-party payment processors (we do not store full payment card details).</li>
              </ul>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Device Information:</strong> Browser type, device type, operating system, and screen resolution.</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, session duration, and interaction patterns.</li>
                <li><strong>Session Tokens:</strong> Unique identifiers generated per review session for fraud prevention.</li>
                <li><strong>Cookies:</strong> Authentication cookies to maintain your login session.</li>
              </ul>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Google OAuth:</strong> When you sign in with Google, we receive your name, email address, and profile picture from Google.</li>
                <li><strong>AI Services:</strong> We use third-party AI services (Groq) to generate review suggestions and analyze sentiment. Customer feedback data is sent to these services for processing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Provide, maintain, and improve the RevuGo platform.</li>
                <li>Generate AI-powered review suggestions based on customer feedback.</li>
                <li>Analyze customer sentiment and provide business insights.</li>
                <li>Process and manage reward campaigns and coupon redemptions.</li>
                <li>Facilitate complaint resolution between customers and businesses.</li>
                <li>Send transactional communications (coupon emails, account notifications).</li>
                <li>Detect and prevent fraud, abuse, and unauthorized access.</li>
                <li>Comply with legal obligations and enforce our terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">4. How We Share Your Information</h2>
              <p>We do not sell your personal information. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>With Business Owners:</strong> Customer feedback, ratings, MCQ responses, and complaint details are shared with the respective business owner for service improvement.</li>
                <li><strong>Service Providers:</strong> We use Supabase (database and authentication), Groq (AI processing), Vercel (hosting), and Resend (email delivery) to operate our platform.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, legal process, or governmental request.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">5. Customer (End-User) Privacy</h2>
              <p>
                RevuGo is designed with customer privacy as a priority:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Anonymous Reviews:</strong> Customers are not required to create an account or provide personal information to leave a review.</li>
                <li><strong>Complaint Anonymity:</strong> Customers can file complaints anonymously. Contact details are only collected with explicit consent.</li>
                <li><strong>No Tracking Across Businesses:</strong> We do not create profiles that track a customer across multiple businesses.</li>
                <li><strong>Consent-Based Contact:</strong> Business owners can only access customer contact information when the customer explicitly consents to share it.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>All data is encrypted in transit using TLS/SSL.</li>
                <li>Database access is protected by Row Level Security (RLS) policies.</li>
                <li>Authentication is managed through Supabase with secure session management.</li>
                <li>Access to administrative functions is restricted to authorized personnel.</li>
                <li>We conduct regular security reviews of our codebase and infrastructure.</li>
              </ul>
              <p className="mt-2">
                While we strive to protect your information, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">7. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Data:</strong> Retained as long as your account is active. You may request deletion at any time.</li>
                <li><strong>Review Data:</strong> Retained as long as the associated business account is active.</li>
                <li><strong>Complaint Data:</strong> Retained for a minimum of 12 months for dispute resolution purposes.</li>
                <li><strong>Coupon Data:</strong> Retained for 12 months after expiry for auditing purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the following rights:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal obligations.</li>
                <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where consent is the legal basis.</li>
                <li><strong>Object:</strong> Object to processing of your personal data for specific purposes.</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at <a href="mailto:support@revugo.in" className="text-[#7C3AED] hover:underline">support@revugo.in</a>.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">9. Cookies</h2>
              <p>
                We use essential cookies only — specifically authentication session cookies required for the platform to function. We do not use advertising, tracking, or analytics cookies. No third-party cookies are set by our platform.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">10. Children&apos;s Privacy</h2>
              <p>
                RevuGo is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 16, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of RevuGo after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">12. Contact Us</h2>
              <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
              <div className="mt-3 p-4 rounded-xl bg-[#F8FAFB] border border-[#E5E7EB]">
                <p><strong>RevuGo</strong></p>
                <p>Email: <a href="mailto:support@revugo.in" className="text-[#7C3AED] hover:underline">support@revugo.in</a></p>
                <p>Location: Mumbai, Maharashtra, India</p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-[13px] text-[#7C3AED] hover:underline font-medium">
            Read our Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
