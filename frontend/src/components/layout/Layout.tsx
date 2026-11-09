import { Outlet, ScrollRestoration, type Location } from "react-router-dom";
import Providers from "@/context/Providers";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Every page opened directly gets the key "default", so it would inherit the
// scroll position of whichever page was opened directly before it.
const scrollKey = (location: Location) =>
  location.key === "default" ? location.pathname : location.key;

/** Navbar and footer around every page, plus the shared state providers. */
export default function Layout() {
  return (
    <Providers>
      <div className="flex min-h-dvh flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration getKey={scrollKey} />
    </Providers>
  );
}
