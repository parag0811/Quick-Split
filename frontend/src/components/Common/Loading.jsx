export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[#22d3ee]/30 rounded-full"></div>
            <svg
              className="w-16 h-16 text-[#22d3ee] relative z-10 animate-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </div>

          <div className="text-4xl font-bold tracking-tight">
            <span className="text-white">Quick </span>
            <span className="text-[#22d3ee]">Split</span>
          </div>
        </div>

        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[#22d3ee] border-r-[#22d3ee] rounded-full animate-spin"></div>

          <div className="absolute inset-3 border-4 border-gray-800 rounded-full"></div>
          <div
            className="absolute inset-3 border-4 border-transparent border-b-[#22d3ee] border-l-[#22d3ee] rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>

          <div className="absolute inset-6 bg-[#22d3ee]/30 rounded-full animate-pulse"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#22d3ee]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-400 text-base font-medium flex items-center gap-1">
            <span>Loading</span>
            <span className="flex gap-[2px]">
              <span
                className="animate-bounce"
                style={{ animationDelay: "0ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "150ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "300ms" }}
              >
                .
              </span>
            </span>
          </div>

          <div className="flex gap-2">
            <div
              className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse"
              style={{ animationDelay: "400ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse"
              style={{ animationDelay: "600ms" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
