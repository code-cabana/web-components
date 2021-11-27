import { wrapper } from "@atomico/react";
import { HTMLMyComponent } from "./simple.component.jsx";

const tagName = "codecabana-simple";
customElements.define(tagName, HTMLMyComponent);

export const Simple = wrapper(tagName, HTMLMyComponent);
