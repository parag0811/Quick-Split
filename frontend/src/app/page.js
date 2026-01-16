import { redirect } from "next/navigation";
import Landing from "../components/Landing/Landing.jsx";
import { getServerSession } from "next-auth";

export default async function Home() {
  const  session = await getServerSession(); // check user logged in or not..
  if (!session) {
    return <Landing />;
  }

  redirect("/dashboard");
}
