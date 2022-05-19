import { c, Host } from "atomico";
import { Hello } from "./index";

// https://twitter.com/atomicojs/status/1519684107764174849/photo/1
function HelloWebComponent(): Host<{}> {
  return (
    <host shadowDom>
      <Hello />
    </host>
  );
}

customElements.define("codecabana-hello", c(HelloWebComponent));
