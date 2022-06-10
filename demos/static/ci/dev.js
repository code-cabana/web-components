// https://github.com/mikeal/watch
import watch from "watch";
import path from "path";

const staticDir = path.resolve(__dirname, "..");

watch.watchTree(staticDir, (f, curr, prev) => {
  if (!(typeof f == "object" && prev === null && curr === null)) {
    console.log("BUILD NOW");
  }
});
