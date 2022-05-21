export type Hello = {
  prop1: string;
  prop2: string;
};

export function Hello({ prop1 = "excellent", prop2 = "it works" }: Hello) {
  return (
    <div>
      Hello there! {prop1} {prop2}
    </div>
  );
}
