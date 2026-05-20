import { SupportPageLayout } from "@/components/layout/SupportPageLayout";
import { Link } from "@/i18n/navigation";

const CONTACT_EMAIL = "director@traceofthetides.org";

export default function ContactPage() {
  return (
    <SupportPageLayout
      title="Contact Us"
      subtitle="We'd love to hear from you"
    >
      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">Get in touch</h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          Questions, ideas, or feedback? Reach the editorial team directly by
          email and we&apos;ll get back to you as soon as we can.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {CONTACT_EMAIL}
        </a>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Want to contribute?
        </h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">
          If you&apos;d like to share a story or join the magazine, head to our{" "}
          <Link
            href="/contribute"
            className="hover:underline"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            Contribute
          </Link>{" "}
          page.
        </p>
      </section>
    </SupportPageLayout>
  );
}
