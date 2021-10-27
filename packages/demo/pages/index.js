import Head from "next/head";
import { getComponentList } from "../lib/data";

export default function Home({ components }) {
  return (
    <div>
      <Head>
        <title>Code Cabana | Web Components</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Code Cabana Web Components</h1>
        <ul>
          {components.map((component, index) => (
            <li key={index}>
              <a href={`/components/${component}`}>{component}</a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export async function getStaticProps(context) {
  const components = await getComponentList();
  return {
    props: { components },
  };
}
