import { getComponentList } from "../../lib/data";
import { renderHtml } from "../../lib/dom";
import getSnippet from "../../snippets";
import MainLayout from "../../layouts/main";
import capitalize from "lodash.capitalize";
import Script from "next/script";

export default function Component({ name }) {
  const snippet = getSnippet(name);
  const prettyName = capitalize(name);
  return (
    <MainLayout title={`Code Cabana | ${prettyName}`}>
      <h1>{prettyName}</h1>
      {snippet && renderHtml(snippet)}
      <Script type="module" src={`/dist/es/${name}.js`} />
    </MainLayout>
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
