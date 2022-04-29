import { c } from "atomico";

function Hello() {
  return (
    <host shadowDom>
      <div>Hello there!</div>
    </host>
  );
}

Hello.props = {
  width: {
    // description: Width of the carousel viewport
    type: String,
    value: "100%",
  },
};

customElements.define("codecabana-hello", c(Hello));
