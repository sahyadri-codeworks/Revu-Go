"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
          <h1 className="text-[28px] font-bold text-[#111] mb-2">Terms of Service</h1>
          <p className="text-[13px] text-[#9CA3AF] mb-8">Last updated: June 28, 2026</p>

          <div className="prose-legal space-y-8 text-[14px] text-[#374151] leading-[1.8]">
            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">1. Agreement to Terms</h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and RevuGo (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) governing your access to and use of the RevuGo platform, including the website, dashboard, APIs, and all related services (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p className="mt-2">
                By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</Link>. If you do not agree, you must not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">2. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must be at least 18 years of age to use the Service.</li>
                <li>You must have the legal authority to enter into a binding agreement.</li>
                <li>If using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</li>
                <li>Your use of the Service must comply with all applicable laws and regulations in your jurisdiction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">3. Description of Service</h2>
              <p>
                RevuGo is an AI-powered customer review and reward platform designed for local businesses in India. The Service provides:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Review Collection:</strong> Tools to collect customer feedback via QR codes, including star ratings, multiple-choice questions, and AI-generated review suggestions.</li>
                <li><strong>Reward Campaigns:</strong> Ability to create and manage promotional campaigns that offer rewards (coupons, discounts) to customers who leave reviews.</li>
                <li><strong>Analytics Dashboard:</strong> Business insights including sentiment analysis, rating trends, keyword tracking, and customer feedback patterns.</li>
                <li><strong>Complaint Management:</strong> A system for receiving and managing customer complaints privately.</li>
                <li><strong>AI Review Generation:</strong> AI-powered generation of unique review text based on customer feedback selections.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">4. User Accounts</h2>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">4.1 Registration</h3>
              <p>
                To access the Service, you must create an account using a valid email address or Google authentication. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
              </p>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">4.2 Account Security</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must immediately notify us of any unauthorized use of your account.</li>
                <li>You are liable for all activities that occur under your account.</li>
                <li>We are not responsible for any loss or damage arising from unauthorized access to your account.</li>
              </ul>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">4.3 Account Termination</h3>
              <p>
                You may terminate your account at any time by contacting us. We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">5. Subscription Plans and Payment</h2>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">5.1 Plans</h3>
              <p>
                The Service is offered through tiered subscription plans (Starter, Growth, Pro) with varying features and limits. Plan details, pricing, and feature sets are available on the platform and may be updated from time to time.
              </p>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">5.2 Payment</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Paid plans require timely payment of applicable fees.</li>
                <li>All fees are quoted in Indian Rupees (INR) unless otherwise stated.</li>
                <li>Payments are processed through secure third-party payment processors.</li>
                <li>You agree to provide valid payment information and authorize recurring charges for subscription renewals.</li>
              </ul>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">5.3 Refunds</h3>
              <p>
                Refunds are handled on a case-by-case basis. If you are dissatisfied with the Service, please contact us within 14 days of payment. We reserve the right to deny refund requests at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">6. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Use the Service for any illegal or unauthorized purpose.</li>
                <li>Generate or post fake, misleading, or fraudulent reviews.</li>
                <li>Manipulate ratings or feedback to deceive consumers.</li>
                <li>Use the Service to harass, abuse, or harm customers or any third party.</li>
                <li>Attempt to gain unauthorized access to other accounts or systems.</li>
                <li>Upload malicious code, viruses, or harmful content.</li>
                <li>Interfere with or disrupt the Service or its infrastructure.</li>
                <li>Resell, sublicense, or redistribute the Service without our written consent.</li>
                <li>Use automated tools (bots, scrapers) to access the Service without authorization.</li>
                <li>Violate any applicable law, regulation, or third-party rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">7. AI-Generated Content</h2>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">7.1 Nature of AI Reviews</h3>
              <p>
                RevuGo uses artificial intelligence to generate review suggestions based on customer feedback inputs (star ratings and MCQ selections). These suggestions are provided as a convenience and starting point for customers.
              </p>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">7.2 Responsibility</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>AI-generated reviews are suggestions only. Customers may edit, modify, or discard them before posting.</li>
                <li>You acknowledge that AI-generated content may not always be perfectly accurate or appropriate.</li>
                <li>You are responsible for ensuring that reviews posted on external platforms (such as Google) comply with those platforms&apos; terms of service.</li>
                <li>We do not guarantee that AI-generated reviews will be accepted by third-party platforms.</li>
              </ul>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">7.3 Compliance</h3>
              <p>
                You agree not to use the AI review generation feature to create deceptive, misleading, or false reviews. The feature is intended to help customers articulate genuine feedback, not to fabricate experiences.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">8. Reward Campaigns</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Business Responsibility:</strong> You are solely responsible for fulfilling all reward offers and coupon redemptions made through your campaigns.</li>
                <li><strong>Truthful Offers:</strong> All campaign offers must be genuine and honoured as described.</li>
                <li><strong>Coupon Validity:</strong> You must honour valid, unredeemed coupons issued through the platform until their stated expiry date.</li>
                <li><strong>Compliance:</strong> Your campaigns must comply with all applicable consumer protection laws, advertising standards, and local regulations.</li>
                <li><strong>No Liability:</strong> RevuGo acts as a technology platform and is not responsible for the fulfilment of rewards by businesses.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">9. Customer Data and Privacy</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must handle all customer data collected through the Service in accordance with applicable privacy laws.</li>
                <li>You may only use customer contact information (when provided with consent) for the purpose of addressing their specific feedback or complaint.</li>
                <li>You must not sell, share, or misuse customer data obtained through the Service.</li>
                <li>You agree to comply with our <Link href="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</Link> regarding data handling.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">10. Intellectual Property</h2>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">10.1 Our Intellectual Property</h3>
              <p>
                The Service, including its design, features, code, branding, logos, and content (excluding user-generated content), is owned by RevuGo and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the Service without our written permission.
              </p>

              <h3 className="text-[15px] font-semibold text-[#111] mt-4 mb-2">10.2 Your Content</h3>
              <p>
                You retain ownership of the content you upload to the Service (business information, logos, campaign details). By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content solely for the purpose of providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">11. Third-Party Services</h2>
              <p>
                The Service integrates with third-party platforms and services including but not limited to Google Maps, Google Business Profile, Supabase, and Groq. Your use of these integrations is subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or content of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">12. Disclaimers</h2>
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <p className="text-[13px] text-[#991B1B] leading-relaxed">
                  THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO NOT GUARANTEE THE ACCURACY OF AI-GENERATED CONTENT OR ANALYTICS DATA.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">13. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>RevuGo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, data, profits, or business opportunities.</li>
                <li>Our total aggregate liability for any claims arising out of or related to the Service shall not exceed the total amount you paid us in the twelve (12) months preceding the claim.</li>
                <li>We are not liable for damages arising from your failure to maintain account security, your violation of these Terms, or actions of third-party services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">14. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless RevuGo, its directors, officers, employees, and agents from any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney&apos;s fees) arising from:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Your use or misuse of the Service.</li>
                <li>Your violation of these Terms.</li>
                <li>Your violation of any applicable law or third-party rights.</li>
                <li>Content you upload or generate through the Service.</li>
                <li>Your failure to fulfil reward campaign obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">15. Governing Law and Disputes</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>These Terms shall be governed by and construed in accordance with the laws of India.</li>
                <li>Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.</li>
                <li>Before filing a formal dispute, both parties agree to attempt resolution through good-faith negotiations for a period of 30 days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">16. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be notified via email or a prominent notice on the platform. Your continued use of the Service after changes constitutes acceptance of the revised Terms. If you do not agree with the updated Terms, you must discontinue use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">17. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">18. Entire Agreement</h2>
              <p>
                These Terms, together with the <Link href="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</Link>, constitute the entire agreement between you and RevuGo regarding the use of the Service and supersede all prior agreements, understandings, and communications.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-[#111] mb-3">19. Contact Us</h2>
              <p>For questions about these Terms, please contact us:</p>
              <div className="mt-3 p-4 rounded-xl bg-[#F8FAFB] border border-[#E5E7EB]">
                <p><strong>RevuGo</strong></p>
                <p>Email: <a href="mailto:support@revugo.in" className="text-[#7C3AED] hover:underline">support@revugo.in</a></p>
                <p>Location: Mumbai, Maharashtra, India</p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-[13px] text-[#7C3AED] hover:underline font-medium">
            Read our Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
