import MainLayout from "../layouts/main";
import { getComponentList } from "../lib/data";
import { blacklist } from "../../../web-components/src/config/components";

export default function Home({ components, blacklist }) {
  return (
    <MainLayout>
      <h1>Code Cabana Web Components</h1>
      <h2>Published</h2>
      <ul>
        {components.map((component, index) => (
          <li key={index}>
            <a href={`/components/${component}`}>{component}</a>
          </li>
        ))}
      </ul>

      <h2>Unpublished</h2>
      <ul>
        {blacklist.map((component, index) => (
          <li key={index}>
            <a href={`/components/${component}`}>{component}</a>
          </li>
        ))}
      </ul>
    </MainLayout>
  );
}

export async function getStaticProps() {
  const components = await getComponentList();
  return {
    props: { components, blacklist },
  };
}
