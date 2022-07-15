import Head from "next/head";
import { openProject } from "../lib/stackblitz";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Web Components by Code Cabana</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <button onClick={openProject}>Open Project</button>
      </main>

      <footer>Footer</footer>
    </div>
  );
}
