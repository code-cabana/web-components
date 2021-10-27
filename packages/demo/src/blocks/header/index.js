import Logo from "../logo";
import Nav from "../nav";
import styles from "./header.module.scss";

export default function Header() {
  return (
    <div className={styles.header}>
      <Logo />
      <Nav />
    </div>
  );
}
