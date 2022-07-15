import "../styles/globals.css";
import type { AppProps } from "next/app";

function WebComponents({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default WebComponents;