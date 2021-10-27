import { c } from "atomico";

function Carousel() {
  return <host shadowDom>carousel</host>;
}

Carousel.props = {};

customElements.define("codecabana-carousel", c(Carousel));
