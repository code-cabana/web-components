export type Hello = {
  prop1: string;
  prop2: string;
};

export function Hello({ prop1 = "prop1val", prop2 = "prop2val" }: Hello) {
  return (
    <div>
      Hello there! {prop1} {prop2}
    </div>
  );
}
