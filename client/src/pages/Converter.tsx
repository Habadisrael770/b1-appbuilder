/**
 * pages/Converter.tsx
 * ===================
 * Production-grade Converter Page
 *
 * Purpose:
 * - Separate ACTION page from Landing (marketing)
 * - Hosts ApkConverter component only
 * - Clean URL: /converter
 *
 * Assumptions:
 * - <ApkConverter /> already exists (production-hardened)
 * - Auth already handled globally (or userId/appId passed for now)
 *
 * This is INTENTIONALLY minimal.
 * No marketing. No hero. No distractions.
 */

import React from "react";
import ApkConverter from "@/components/ApkConverter";

export default function ConverterPage() {
  // TODO: replace with auth context (session.user.id, appId from URL param or app selection)
  const APP_ID = 1;
  const USER_ID = 1;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        padding: "40px 16px",
      }}
    >
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <ApkConverter appId={APP_ID} userId={USER_ID} />
      </section>
    </main>
  );
}

/**
 * OPTIONAL (Landing Page CTA)
 * ===========================
 * Place this in Hero component on index page:
 *
 * import Link from "wouter";
 *
 * <Link href="/converter">
 *   <button>Convert to APK</button>
 * </Link>
 */
