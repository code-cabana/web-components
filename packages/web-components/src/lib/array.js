export const cssJoin = (classes) => {
  return classes.filter(Boolean).join(" ");
};

export const isDefined = (candidate) => {
  return typeof candidate !== "undefined";
};
