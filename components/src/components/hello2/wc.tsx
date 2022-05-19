import { c, Host } from "atomico";
import { Hello2 } from "./index";

function Hello2WebComponent(): Host<{}> {
  return (
    <host shadowDom>
      <Hello2 />
    </host>
  );
}

customElements.define("codecabana-hello2", c(Hello2WebComponent));
