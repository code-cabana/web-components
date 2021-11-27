import { c } from "atomico";
import { auto } from "@atomico/react/auto";

import AccordionFunc from "./accordion/accordion.component.jsx";

customElements.define("codecabana-accordion", c(AccordionFunc));

export const Accordion = auto(c(AccordionFunc));
