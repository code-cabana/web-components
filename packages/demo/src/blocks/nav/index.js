import Link from "next/link";
import styles from "./nav.module.scss";

const navLinks = [{ label: "Home", href: "/" }];

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <ul>
        {navLinks.map(({ label, href }, index) => (
          <li key={index}>
            <Link href={href || `/${label.toLocaleLowerCase()}`}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
