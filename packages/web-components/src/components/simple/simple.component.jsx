import { c, html } from "atomico";

function Simple({ name }) {
  return html`<host shadowDom>Hello World</host>`;
}

Simple.props = {
  name: String,
};

customElements.define("codecabana-simple", c(Simple));

export const HTMLMyComponent = html`<host shadowDom>Hello World</host>`;
