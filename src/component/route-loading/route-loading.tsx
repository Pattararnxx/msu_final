import styles from "./route-loading.module.css";

interface RouteLoadingProps {
  label: string;
}

export default function RouteLoading({ label }: RouteLoadingProps) {
  return (
    <main className={styles.page} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.statusRow}>
        <span className={styles.spinner} aria-hidden="true" />
        <div>
          <strong className={styles.title}>{label}</strong>
          <span className={styles.description}>กำลังเตรียมข้อมูลตัวอย่าง…</span>
        </div>
      </div>

      <div className={styles.skeleton} aria-hidden="true">
        <span className={styles.headingLine} />
        <div className={styles.cardRow}>
          <span />
          <span />
          <span />
        </div>
        <span className={styles.contentBlock} />
      </div>
    </main>
  );
}
