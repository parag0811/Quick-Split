"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Coins,
  ReceiptText,
  SendHorizontal,
  Split,
  Sparkles,
  TrendingUp,
  Zap,
  RefreshCcw,
} from "lucide-react";
import LandingHeader from "../../../components/Landing/sections/LandingHeader";
import LandingFooter from "../../../components/Landing/sections/LandingFooter";

const phaseCards = [
  {
    phase: "Phase 01",
    title: "Create a Group",
    description:
      "Initialize your ledger, invite participants via secure links, and set your base currency for the expedition.",
    icon: Coins,
  },
  {
    phase: "Phase 02",
    title: "Add Expenses",
    description:
      "Deploy costs instantly. Smart receipt capture and split controls preserve accuracy for every member.",
    icon: ReceiptText,
  },
  {
    phase: "Phase 03",
    title: "Settle Instantly",
    description:
      "Execute balances in one click. Anomaly-aware checks reduce errors before payout is confirmed.",
    icon: SendHorizontal,
  },
];

const superiorityCards = [
  {
    title: "Groq Smart Split Suggestion",
    description:
      "Context-aware split recommendations generated with Groq help groups choose fair percentage allocations for uneven usage.",
    icon: Sparkles,
    className: "md:col-span-2",
  },
  {
    title: "AI Spending Insights",
    description:
      "Groq analyzes member spend behavior to surface imbalance signals, overpayment patterns, and actionable recommendations.",
    icon: Split,
    className: "md:col-span-1",
  },
  {
    title: "Expense Anomaly Detection Model",
    description:
      "ML anomaly scoring flags unusual or suspicious expense entries early using historical group spending patterns.",
    icon: TrendingUp,
    className: "md:col-span-1",
  },
  {
    title: "Settlement Risk Prediction Model",
    description:
      "Predictive risk scoring estimates settlement delay probability so groups can prioritize high-risk dues before they become blockers.",
    icon: Zap,
    className: "md:col-span-2",
  },
];

const HowItWorks = () => {
  const router = useRouter();

  const handleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#020919] text-[#d8e4ff]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(95,35,146,0.3),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(26,173,255,0.22),transparent_36%),linear-gradient(180deg,#051536_0%,#020b1f_45%,#020818_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(95,35,146,0.25)_0%,transparent_28%,rgba(58,162,255,0.22)_45%,transparent_70%,rgba(39,130,221,0.15)_100%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_17px,rgba(49,91,145,0.4)_18px)] bg-size-[100%_18px] opacity-20" />

      <div className="relative z-10">
        <LandingHeader onLogin={handleSignUp} onSignup={handleSignUp} />

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.push("/")}
            className="mb-8 flex items-center gap-2 text-sm text-[#8cabd3] transition hover:text-[#dbebff]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-4 pb-14 text-center sm:px-6 lg:px-8"
        >
          <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight text-[#e5efff] sm:text-5xl md:text-6xl">
            Precision <span className="text-[#49d6ff]">Social Finance</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#9bb1d3] sm:text-base">
            Stop chasing pennies. Quick Split provides the technical infrastructure for your social circle&apos;s economy.
            High-velocity splitting, zero friction.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-20 grid w-full max-w-7xl gap-6 px-4 md:grid-cols-3 sm:px-6 lg:px-8"
        >
          {phaseCards.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <article
                key={phase.title}
                className="rounded-xl border border-[#1a2c52] bg-[linear-gradient(165deg,rgba(7,24,51,0.96),rgba(4,14,33,0.82))] p-6"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#254578] bg-[#102347] shadow-[0_0_0_1px_rgba(76,168,255,0.1)]">
                  <Icon className="h-5 w-5 text-[#7fd9ff]" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f97be]">
                  {phase.phase}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#dce8ff]">
                  {phase.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#88a1c8]">
                  {phase.description}
                </p>
                {index !== phaseCards.length - 1 ? (
                  <div className="mt-6 h-px w-full bg-linear-to-r from-[#2a446d] via-[#203152] to-transparent" />
                ) : null}
              </article>
            );
          })}
        </motion.div>

        <section
          id="features"
          className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
        >
          <motion.h3
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center text-3xl font-bold uppercase text-[#dce8ff] sm:text-5xl"
          >
            AI + ML Intelligence Layer
          </motion.h3>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#25ceff]" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {superiorityCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className={`rounded-xl border border-[#182d51] bg-[linear-gradient(165deg,rgba(7,24,51,0.96),rgba(4,14,33,0.82))] p-7 ${card.className}`}
                >
                  <Icon className="mb-6 h-6 w-6 text-[#8ce0ff]" />
                  <h4 className="text-3xl font-semibold leading-tight text-[#dce8ff] sm:text-4xl">
                    {card.title}
                  </h4>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#88a1c8]">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </motion.div>
        </section>

        <section id="about" className="px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto flex max-w-5xl flex-col items-center rounded-2xl border border-[#203c66] bg-[linear-gradient(150deg,rgba(15,34,62,0.92),rgba(8,20,40,0.92))] px-6 py-12 text-center sm:px-10"
          >
            <Sparkles className="h-6 w-6 text-[#49d6ff]" />
            <h5 className="mt-3 text-3xl font-bold text-[#dce8ff] sm:text-4xl">
              Ready to split smarter?
            </h5>
            <p className="mt-3 max-w-2xl text-base text-[#90a9cf]">
              Launch your next group ledger with Quick Split and automate accurate settlements from day one.
            </p>

            <button
              onClick={handleSignUp}
              className="mt-7 cursor-pointer rounded-md bg-[#23ccff] px-10 py-4 text-sm font-bold uppercase tracking-[0.09em] text-[#03263d] shadow-[0_12px_30px_rgba(35,204,255,0.3)] transition hover:bg-[#6ce2ff]"
            >
              Get Started
            </button>
          </motion.div>
        </section>

        <LandingFooter />
      </div>
    </main>
  );
};

export default HowItWorks;
