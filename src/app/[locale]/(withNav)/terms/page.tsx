import { SupportPageLayout } from "@/components/layout/SupportPageLayout";

export default function TermsPage() {
  return (
    <SupportPageLayout title="Terms of Service" subtitle="Effective Date: [Insert Date]">
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">1. Acceptance of Terms</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          By accessing or using [yourdomain.com], you agree to these Terms of Service and our
          Privacy Policy. If you do not agree, please do not use the website.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">2. Use of the Website</h2>
        <p className="mb-4 leading-relaxed text-[#aaaaaa]">You agree to:</p>
        <ul className="list-disc space-y-2 pl-6 text-[#aaaaaa]">
          <li>Use the site only for lawful, non-commercial purposes</li>
          <li>Respect intellectual property rights</li>
          <li>Not interfere with or disrupt the site or servers</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">3. User Content</h2>
        <p className="mb-4 leading-relaxed text-[#aaaaaa]">If you upload or contribute content:</p>
        <ul className="list-disc space-y-2 pl-6 text-[#aaaaaa]">
          <li>
            You retain ownership, but grant us a license to display, share, and archive your content
            on our platform
          </li>
          <li>You must not upload content that is unlawful, defamatory, infringing, or harmful</li>
        </ul>
        <p className="mt-4 leading-relaxed text-[#aaaaaa]">
          We reserve the right to remove any content at our discretion.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">4. Intellectual Property</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          All content on this website — including text, design, logos, videos, and other media — is
          either owned by or licensed to us and protected by copyright and intellectual property
          laws.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">5. Links to Other Websites</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          Our site may contain links to third-party websites. We are not responsible for their
          content, policies, or practices.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">6. Disclaimers</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          The content provided is for educational and informational purposes. While we strive for
          accuracy, we make no warranties about the completeness, reliability, or accuracy of any
          content.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">7. Limitation of Liability</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          We are not liable for any direct, indirect, incidental, or consequential damages arising
          from your use of this website.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">8. Modifications</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          We may update these Terms of Service at any time. Continued use of the site means you
          accept the revised terms.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">9. Governing Law</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          These terms are governed by the laws of [Your Country/State]. Any disputes shall be
          resolved under the jurisdiction of [Your Jurisdiction].
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">10. Contact Us</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          📧 Email:{" "}
          <a
            href="mailto:your-email@example.com"
            className="hover:underline"
            style={{ color: "#CBA158" }}
          >
            [your-email@example.com]
          </a>
        </p>
        <p className="leading-relaxed text-[#aaaaaa]">
          📍 Address: [Your Organization, Street Address, City, Country]
        </p>
      </section>
    </SupportPageLayout>
  );
}
