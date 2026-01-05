import "./globals.css";

export const metadata = {
  title: "Quick Split",
  description: "Split group expenses, track payments, and settle balances easily with Quick Split.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
