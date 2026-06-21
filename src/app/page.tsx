import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.placeholder}>
      <div className={styles.card}>
        <h1 className={styles.title}>TinySprite</h1>
        <p className={styles.subtitle}>a tiny, cozy pixel-art editor</p>
        <p className={styles.note}>milestone 1 — setup complete</p>
      </div>
    </main>
  );
}
