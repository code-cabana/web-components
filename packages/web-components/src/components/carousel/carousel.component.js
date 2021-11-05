import { c } from "atomico";

function Carousel({} = {}) {
  return (
    <host shadowDom tabindex={0}>
      <div>restart</div>
    </host>
  );
}

Carousel.props = {};

customElements.define("codecabana-carousel", c(Carousel));
