"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { HeadsetIcon } from "@/components/ui/icons";
import { springs } from "@/lib/motion";

interface Props {
  title: string;
  heading: string;
  body: string;
  cta: string;
  contactPrompt: string;
  contact: string;
  contactSuffix: string;
}

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function NotFound404Content({
  title, heading, body, cta, contactPrompt, contact, contactSuffix,
}: Props) {
  return (
    <motion.div
      className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <div className="flex w-full flex-col items-center text-center">

        <motion.p
          className="text-base font-medium tracking-wide sm:text-lg"
          style={{ color: "var(--tott-muted)" }}
          variants={item}
          transition={springs.gentle}
        >
          {title}
        </motion.p>

        {/* Entrance via parent variant; inner element handles continuous float */}
        <motion.div variants={item} transition={springs.gentle}>
          <motion.p
            aria-hidden
            className="select-none font-black leading-none"
            style={{
              fontSize: "clamp(5rem, 22vw, 20rem)",
              letterSpacing: "-0.03em",
              color: "var(--tott-card-border)",
              marginTop: "0.15rem",
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            404
          </motion.p>
        </motion.div>

        <motion.h1
          className="mt-4 text-lg font-bold sm:text-2xl"
          style={{ color: "var(--foreground)" }}
          variants={item}
          transition={springs.gentle}
        >
          {heading}
        </motion.h1>

        <motion.p
          className="mt-2 max-w-md text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--tott-muted)" }}
          variants={item}
          transition={springs.gentle}
        >
          {body}
        </motion.p>

        <motion.div
          variants={item}
          transition={springs.gentle}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl px-8 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--tott-accent-gold)] focus:ring-offset-2"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "var(--tott-on-accent)",
            }}
          >
            {cta}
          </Link>
        </motion.div>

        <motion.p
          className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm"
          style={{ color: "var(--tott-muted)" }}
          variants={item}
          transition={springs.gentle}
        >
          <span>{contactPrompt}</span>
          <span
            className="inline-flex shrink-0 items-center"
            style={{ color: "var(--tott-dash-gold-label)" }}
            aria-hidden
          >
            <HeadsetIcon />
          </span>
          <Link
            href="/contact"
            className="font-medium hover:underline"
            style={{ color: "var(--tott-dash-gold-label)" }}
          >
            {contact}
          </Link>
          <span>{contactSuffix}</span>
        </motion.p>

      </div>
    </motion.div>
  );
}
