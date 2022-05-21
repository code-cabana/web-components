import { c } from "atomico";

export function asWebComponent({
  name,
  component,
  props = {},
  hostProps = {},
}) {
  function webComponent() {
    return (
      <host shadowDom {...hostProps}>
        {component({})}
      </host>
    );
  }

  webComponent.props = props;

  customElements.define(`codecabana-${name}`, c(webComponent));
}
