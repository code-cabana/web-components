import Head from "next/head";
import Header from "../blocks/header";

export default function MainLayout({
  title = "Code Cabana | Web Components",
  children,
}) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  );
}
