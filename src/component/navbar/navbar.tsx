"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";

const DESKTOP_QUERY = "(min-width: 1100px)";

interface NavSubLink {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  items?: NavSubLink[];
}

// Wording is a placeholder — swap for real copy when it's ready.
const NAV_LINKS: NavLink[] = [
  {
    label: "ไฮไลท์",
    href: "#",
    items: [
      { label: "หน้าหลัก", href: "#" },
      { label: "สินเชื่อ", href: "#" },
      { label: "เงินฝาก", href: "#" },
    ],
  },
  { label: "ผลิตภัณฑ์", href: "#" },
  { label: "โปรโมชั่น", href: "#" },
  { label: "Better Tips", href: "#" },
  { label: "ช่วยเหลือ", href: "#" },
];

function Icon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[styles.icon, className].filter(Boolean).join(" ")}
      style={{ "--icon-src": `url(${src})` } as React.CSSProperties}
    />
  );
}

export default function Navbar() {
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close the open desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (!openDesktopMenu) return;

    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenDesktopMenu(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDesktopMenu]);

  // Close the mobile panel if the viewport grows into the desktop layout.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setMobileOpen(false);
        setOpenMobileMenu(null);
      }
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo intentionally left out — placeholder mark until brand assets are ready */}
        <Link href="/" className={styles.brand}>
          Better
        </Link>

        <nav className={styles.nav} aria-label="Main" ref={navRef}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.label} className={styles.navItem}>
                {link.items ? (
                  <>
                    <button
                      type="button"
                      className={styles.navLink}
                      aria-expanded={openDesktopMenu === link.label}
                      onClick={() =>
                        setOpenDesktopMenu((current) =>
                          current === link.label ? null : link.label,
                        )
                      }
                    >
                      {link.label}
                      <Icon
                        src="/icon/regular/caret-down.svg"
                        className={[
                          styles.caret,
                          openDesktopMenu === link.label
                            ? styles.caretOpen
                            : "",
                        ].join(" ")}
                      />
                    </button>
                    {openDesktopMenu === link.label && (
                      <ul className={styles.dropdown}>
                        {link.items.map((item) => (
                          <li key={item.label} className={styles.dropdownItem}>
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link href="#" className={styles.downloadButton}>
            ดาวน์โหลด
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-panel"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Icon src={mobileOpen ? "/icon/regular/x.svg" : "/icon/regular/list.svg"} />
            <span className={styles.srOnly}>
              {mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="navbar-mobile-panel" className={styles.mobilePanel}>
          <ul className={styles.mobileNavList}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.items ? (
                  <>
                    <button
                      type="button"
                      className={styles.mobileNavLink}
                      aria-expanded={openMobileMenu === link.label}
                      onClick={() =>
                        setOpenMobileMenu((current) =>
                          current === link.label ? null : link.label,
                        )
                      }
                    >
                      {link.label}
                      <Icon
                        src="/icon/regular/caret-down.svg"
                        className={[
                          styles.caret,
                          openMobileMenu === link.label
                            ? styles.caretOpen
                            : "",
                        ].join(" ")}
                      />
                    </button>
                    {openMobileMenu === link.label && (
                      <ul className={styles.mobileDropdownPanel}>
                        {link.items.map((item) => (
                          <li key={item.label}>
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={link.href} className={styles.mobileNavLink}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <Link href="#" className={styles.downloadButton}>
              ดาวน์โหลด
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
