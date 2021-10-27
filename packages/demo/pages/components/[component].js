import { getComponentList } from "../../lib/data";
import { renderHtml } from "../../lib/dom";
import getSnippet from "../../snippets";
import Script from "next/script";
import Head from "next/head";

export default function Component({ name }) {
  const snippet = getSnippet(name);
  return (
    <div>
      <Head>
        <title>Code Cabana | {name}</title>
      </Head>

      <main>
        <h1>{name}</h1>
        {snippet && renderHtml(snippet)}
        <Script type="module" src={`/dist/es/${name}.js`} />
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = (await getComponentList()).map((component) => ({
    params: { component },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { component: name } = context.params;
  const Element = `codecabana-${name}`;
  return {
    props: { name, Element },
  };
}
