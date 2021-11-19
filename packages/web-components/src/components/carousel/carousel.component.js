import { c } from "atomico";

function Carousel({} = {}) {
  return (
    <host shadowDom tabindex={0}>
      {[...Array(100)].map((_, i) => {
        return <div>{i}</div>;
      })}
    </host>
  );
}

Carousel.props = {};

customElements.define("codecabana-carousel", c(Carousel));
