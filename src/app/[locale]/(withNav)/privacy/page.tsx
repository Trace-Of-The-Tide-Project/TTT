import { SupportPageLayout } from "@/components/layout/SupportPageLayout";

export default function PrivacyPage() {
  return (
    <SupportPageLayout title="Privacy Policy" subtitle="Effective Date: [Insert Date]">
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">1. Introduction</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          We value your privacy and are committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, and share information when you use our
          website [yourdomain.com].
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">2. Information We Collect</h2>
        <p className="mb-4 leading-relaxed text-[#aaaaaa]">
          We may collect the following types of information:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[#aaaaaa]">
          <li>
            <strong className="text-[#d1d1d1]">Personal Information:</strong> Name, email, or other
            details you voluntarily submit (e.g., contact forms or newsletter subscriptions).
          </li>
          <li>
            <strong className="text-[#d1d1d1]">Usage Data:</strong> IP address, browser type,
            device, pages visited, and time spent — collected via cookies and analytics tools.
          </li>
          <li>
            <strong className="text-[#d1d1d1]">Uploaded Content:</strong> Any content (articles,
            comments, media) you submit or contribute.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">3. How We Use Your Information</h2>
        <p className="mb-4 leading-relaxed text-[#aaaaaa]">We use your data to:</p>
        <ul className="list-disc space-y-2 pl-6 text-[#aaaaaa]">
          <li>Provide and maintain our services</li>
          <li>Improve user experience and content relevance</li>
          <li>Respond to inquiries or support requests</li>
          <li>Send occasional updates (only with your consent)</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">4. Sharing and Disclosure</h2>
        <p className="mb-4 leading-relaxed text-[#aaaaaa]">
          We do not sell or share your personal information with third parties, except:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[#aaaaaa]">
          <li>
            With service providers (e.g., hosting, analytics) under confidentiality agreements
          </li>
          <li>If required by law or legal process</li>
          <li>To prevent fraud or protect the security of our services</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">5. Cookies and Analytics</h2>
        <p className="leading-relaxed text-[#aaaaaa]">
          We use cookies and similar technologies to collect usage data and improve our services.
          You can control cookie preferences through your browser settings. We may use analytics
          services (e.g., Google Analytics) to understand how visitors use our site and to optimize
          content and performance.
        </p>
      </section>
    </SupportPageLayout>
  );
}
