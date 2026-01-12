"use client";
import {  signIn } from "next-auth/react";

const Landing = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold mb-4">Quick Split</h1>
      <p className="text-3xl">
        Split group expenses, track payments, and settle balances easily
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button className="cursor-pointer bg-[#222255] text-white px-6 py-3 rounded hover:text-black hover:bg-[#FFFFFF] transition">
          Get Started
        </button>
        <button
          className="cursor-pointer bg-white text-black px-6 py-3 rounded hover:text-white hover:bg-[#222255] transition"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign In
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="p-6 bg-[#111] rounded-lg hover:bg-[#1a1a1a] transition">
          <h3 className="text-xl font-semibold mb-2">Smart Splits</h3>
          <p className="text-gray-400">
            Split expenses equally or customize amounts with ease.
          </p>
        </div>

        <div className="p-6 bg-[#111] rounded-lg hover:bg-[#1a1a1a] transition">
          <h3 className="text-xl font-semibold mb-2">Payment Tracking</h3>
          <p className="text-gray-400">
            Track who has paid and who still owes in real time.
          </p>
        </div>

        <div className="p-6 bg-[#111] rounded-lg hover:bg-[#1a1a1a] transition">
          <h3 className="text-xl font-semibold mb-2">Group Expenses</h3>
          <p className="text-gray-400">
            Manage trips, roommates, or events in separate groups.
          </p>
        </div>

        <div className="p-6 bg-[#111] rounded-lg hover:bg-[#1a1a1a] transition">
          <h3 className="text-xl font-semibold mb-2">Clear Balances</h3>
          <p className="text-gray-400">
            Instantly see who owes whom and settle faster.
          </p>
        </div>
      </div>

      <section className="mt-16 max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
        <p className="text-gray-400 text-lg">
          Have questions or feedback? Reach out at{" "}
          <a
            href="mailto:support@quicksplit.app"
            className="text-orange-400 hover:underline"
          >
            support@quicksplit.app
          </a>
        </p>
      </section>
    </main>
  );
};

export default Landing;
