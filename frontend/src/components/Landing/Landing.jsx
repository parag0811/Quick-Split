"use client";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Activity,
  BrainCircuit,
  ScanLine,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import LandingHeader from "./sections/LandingHeader";
import LandingFooter from "./sections/LandingFooter";

const featureCards = [
  {
    title: "Zero-Latency Sync",
    description:
      "Our proprietary ledger keeps every update synchronized across devices in real-time. No second-guessing balances.",
    icon: Sparkles,
    wide: true,
    tags: ["Instant Notifications", "Cloud Multi-Ledger"],
  },
  {
    title: "Expense Anomaly Prediction",
    description:
      "ML-driven spend checks detect unusual expense patterns early, helping your group correct mistakes before settlement day.",
    icon: BrainCircuit,
    wide: false,
  },
  {
    title: "Deep Insights",
    description:
      "Visualize how money moves across trips, homes, and events using clear trend analytics.",
    icon: Activity,
    wide: false,
  },
  {
    title: "Infinite Groups",
    description:
      "Organize your life into ledgers. Roommates, travel partners, and dinner circles all in one place.",
    icon: Users,
    wide: false,
  },
];

const groupTypes = ["Travel", "Home", "Dinner", "Events"];

const Landing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();

  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, redirect, router]);

  const handleSignUp = () => {
    signIn("google", {
      callbackUrl: redirect ? redirect : "/dashboard",
    });
  };

  return (
    <main
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#020816] text-[#d5e3ff]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-5%,rgba(0,181,255,0.24),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(11,92,200,0.22),transparent_36%),linear-gradient(180deg,#041234_0%,#020b1f_48%,#020816_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/q_s_bg.jpg')] bg-cover bg-center opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(67,164,255,0.07),transparent_45%),radial-gradient(circle_at_20%_70%,rgba(71,211,255,0.09),transparent_35%)]" />

      <div className="relative z-10">
        <LandingHeader onLogin={handleSignUp} onSignup={handleSignUp} />

        <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:pb-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex rounded-full border border-[#1a4f7d] bg-[#07213f]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7dcfff]">
              New: smart settlement v2.0
            </span>
            <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#dfeaff] sm:text-6xl lg:text-7xl">
              Quick Split
            </h1>
            <p className="mt-4 max-w-xl text-base text-[#9db4d8] sm:text-xl">
              Split expenses with friends. No stress. No confusion. The ultimate
              ledger for fast-moving social finances.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="cursor-pointer rounded-md bg-[#1acbff] px-8 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#03253a] shadow-[0_12px_28px_rgba(26,203,255,0.28)] transition hover:bg-[#68e2ff]"
                onClick={handleSignUp}
              >
                Get Started
              </button>
              <button
                className="cursor-pointer rounded-md border border-[#2f4468] bg-[#0a1733]/80 px-8 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#d2e3ff] transition hover:border-[#4f73ae] hover:bg-[#102248]"
                onClick={() => router.push("/how-it-works")}
              >
                See How It Works
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="self-center rounded-xl border border-[#243c64] bg-[linear-gradient(160deg,rgba(13,34,63,0.94),rgba(6,18,38,0.9))] p-5 shadow-[0_20px_60px_rgba(3,11,28,0.62)]"
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#6587b6]">
              <p>Total Group Balance</p>
              <WalletCards size={16} className="text-[#35caff]" />
            </div>
            <p className="mt-2 text-4xl font-bold text-[#4dd8ff]">$2,440.50</p>

            <div className="mt-5 space-y-4 text-sm text-[#90a9cf]">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-[#0a1d3f]/85 px-3 py-3">
                <div>
                  <p className="font-semibold text-[#d6e3ff]">Japan Dariko</p>
                  <p className="text-xs text-[#7390bb]">
                    Sushi Dinner • 2h ago
                  </p>
                </div>
                <p className="font-semibold text-[#ff7d92]">-$124.00</p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-[#0a1d3f]/85 px-3 py-3">
                <div>
                  <p className="font-semibold text-[#d6e3ff]">Sarah Void</p>
                  <p className="text-xs text-[#7390bb]">
                    Payhouse Rent • 5h ago
                  </p>
                </div>
                <p className="font-semibold text-[#5be3ff]">+$850.00</p>
              </div>
            </div>

            <div className="mt-4 w-fit rounded-lg border border-[#224974] bg-[#0a1f43]/85 p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7495c1]">
                <ScanLine size={12} />
                Real-time trends
              </div>
              <div className="flex items-end gap-1">
                {[7, 10, 8, 14, 12].map((height, index) => (
                  <span
                    key={index}
                    className="w-1.5 rounded-sm bg-[#4ad7ff]"
                    style={{ height: `${height * 2}px` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center text-3xl font-bold text-[#dde8ff] sm:text-4xl"
          >
            Precision in every split.
          </motion.h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#17c8ff]" />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className={`rounded-xl border border-[#162a4a] bg-[linear-gradient(160deg,rgba(8,28,57,0.95),rgba(4,16,36,0.82))] p-7 ${
                    feature.wide ? "md:col-span-2" : ""
                  }`}
                >
                  <Icon className="mb-5 text-[#4ad7ff]" size={22} />
                  <h3 className="text-3xl font-semibold text-[#dce7ff]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#87a3cb]">
                    {feature.description}
                  </p>

                  {feature.tags?.length ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {feature.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#1f3b69] bg-[#102549] px-3 py-2 text-xs font-semibold text-[#8ad7ff]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </motion.article>
              );
            })}

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
              className="rounded-xl border border-[#162a4a] bg-[linear-gradient(160deg,rgba(8,28,57,0.95),rgba(4,16,36,0.82))] p-7 md:col-span-2 lg:col-span-1"
            >
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#7192c0]">
                Ledger Channels
              </p>
              <div className="grid grid-cols-2 gap-3">
                {groupTypes.map((group, index) => (
                  <div
                    key={group}
                    className="flex items-center justify-center rounded-md border border-[#2a436f] bg-[#111f3f] px-4 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#d8e5ff]"
                    style={{
                      boxShadow:
                        index % 2 === 0
                          ? "inset 3px 0 0 rgba(85,226,255,0.9)"
                          : "inset 3px 0 0 rgba(255,96,140,0.9)",
                    }}
                  >
                    {group}
                  </div>
                ))}
              </div>
            </motion.article>
          </div>
        </section>

        <section id="about" className="px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto max-w-5xl rounded-2xl border border-[#1f365f] bg-[linear-gradient(135deg,rgba(14,36,67,0.9),rgba(8,22,42,0.9))] px-6 py-12 text-center sm:px-12"
          >
            <h3 className="text-4xl font-bold text-[#dce8ff]">
              Ready to settle the score?
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-[#91aad0]">
              Join over 250,000 users who trust Quick Split for transparent
              shared finances.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="cursor-pointer rounded-md bg-[#25ccff] px-10 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[#032137] shadow-[0_14px_32px_rgba(37,204,255,0.32)] transition hover:bg-[#79e5ff]"
                onClick={() => router.push("/how-it-works")}
              >
                See How It Works
              </button>
              <div className="flex rounded-lg border border-[#284979] bg-[#0c1d3f] p-1">
                {[
                  { initials: "AR", bg: "bg-[#2a6fb4]" },
                  { initials: "NV", bg: "bg-[#3a8b57]" },
                  { initials: "JK", bg: "bg-[#905f34]" },
                ].map((user) => (
                  <span
                    key={user.initials}
                    aria-label={`User ${user.initials}`}
                    className={`-ml-2 flex h-9 w-9 items-center justify-center rounded-md border border-[#17345c] text-xs font-bold text-white first:ml-0 ${user.bg}`}
                  >
                    {user.initials}
                  </span>
                ))}
                <span className="ml-2 flex h-9 items-center rounded-md border border-[#17345c] bg-[#142b53] px-2 text-xs font-semibold text-[#c4d8fb]">
                  +2k
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <LandingFooter />
      </div>
    </main>
  );
};

export default Landing;
