import Head from "next/head";
import { getComponentList } from "../../lib/data";

export default function Component({ name, Element }) {
  return (
    <div>
      <Head>
        <title>Code Cabana | {name}</title>
        <script type="module" src={`/dist/es/${name}.js`}></script>
      </Head>

      <main>
        <h1>{name}</h1>
        <Element></Element>
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
