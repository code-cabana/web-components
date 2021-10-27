import MainLayout from "../layouts/main";
import { getComponentList } from "../lib/data";

export default function Home({ components }) {
  return (
    <MainLayout>
      <h1>Code Cabana Web Components</h1>
      <ul>
        {components.map((component, index) => (
          <li key={index}>
            <a href={`/components/${component}`}>{component}</a>
          </li>
        ))}
      </ul>
    </MainLayout>
  );
}

export async function getStaticProps(context) {
  const components = await getComponentList();
  return {
    props: { components },
  };
}
