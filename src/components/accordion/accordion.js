import { c, useProp } from "atomico";

const style = `
  * {
    font-size: 200%;
  }

  span {
    width: 4rem;
    display: inline-block;
    text-align: center;
  }

  button {
    width: 4rem;
    height: 4rem;
    border: none;
    border-radius: 10px;
    background-color: seagreen;
    color: white;
  }
`;

function Accordion() {
  let [count, setCount] = useProp("count");

  return (
    <host shadowDom>
      <style>{style}</style>
      <button onclick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onclick={() => setCount(count + 1)}>+</button>
    </host>
  );
}

Accordion.props = {
  count: {
    type: Number,
    reflect: true,
    value: 0,
  },
};

customElements.define("codecabana-accordion", c(Accordion));
