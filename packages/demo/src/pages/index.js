import MainLayout from "../layouts/main";
import { getComponentList } from "../lib/data";

export default function Home({ components }) {
  return (
    <MainLayout>
      <h1>Code Cabana Web Components</h1>
      <ul>
        {components.map((component, index) => (
          <li key={index}>
            {component} &middot;{" "}
            <a href={`/components/static/${component}`}>static</a> &middot;{" "}
            <a href={`/components/module/${component}`}>module</a>
          </li>
        ))}
      </ul>
    </MainLayout>
  );
}

export async function getStaticProps() {
  const components = await getComponentList();
  return {
    props: { components },
  };
}
