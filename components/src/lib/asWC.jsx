import { c } from "atomico";

export function asWebComponent({
  name,
  component,
  props = {},
  hostProps = {},
  styles,
}) {
  function webComponent() {
    return (
      <host shadowDom {...hostProps}>
        {component({})}
        {styles && <style>{styles}</style>}
      </host>
    );
  }

  webComponent.props = props;

  customElements.define(`codecabana-${name}`, c(webComponent));
}
