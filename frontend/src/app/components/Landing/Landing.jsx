const Landing = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold mb-4">Quick Split</h1>
      <p className="text-3xl">
        Split group expenses, track payments, and settle balances easily
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button className="cursor-pointer bg-[#222255] text-white px-6 py-3 rounded">
          Get Started
        </button>
        <button className="cursor-pointer bg-white text-black px-6 py-3 rounded">
          Sign In
        </button>
      </div>
    </main>
  );
};

export default Landing;
