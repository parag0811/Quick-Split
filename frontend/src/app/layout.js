import "./globals.css";
import SessionWrapper from "../components/SessionWrapper.js";
import { Provider } from "react-redux";
import { store } from "../../store/store";

export const metadata = {
  title: "Quick Split",
  description:
    "Split group expenses, track payments, and settle balances easily with Quick Split.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <SessionWrapper>{children}</SessionWrapper>
        </Provider>
      </body>
    </html>
  );
}
