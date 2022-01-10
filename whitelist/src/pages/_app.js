import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import AppProvider from "../context/app.context";
import "@material-tailwind/react/tailwind.css";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DefaultSeo } from "next-seo";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo titleTemplate="%s | B-Event" />
      <ToastContainer />
      <AppProvider>
        <>
          <NavBar />
          <div className="pt-16">
            <Component {...pageProps} />
          </div>
          <Footer />
        </>
      </AppProvider>
    </>
  );
}

export default MyApp;
