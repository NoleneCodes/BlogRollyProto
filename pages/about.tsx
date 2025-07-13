
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const About: NextPage = () => {
  return (
    <Layout title="About - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>About Blogrolly</h1>
        <p className={styles.description}>
          Learn more about our mission to help you discover and organize your favorite blogs
        </p>
      </div>

      <div className={styles.pronunciationCard}>
        <h3>Pronunciation: Blog-Roll-Lee</h3>
        <div className={styles.definition}>
          <strong>Definition:</strong><br />
          Blogroll – A list of hyperlinks to blogs or websites.
        </div>
      </div>

      <div className={styles.missionSection}>
        <h2>Our Mission: A Quiet Revolution for Indie Bloggers</h2>
        <p>
          BlogRolly has a simple mission:<br />
          To reconnect the fragmented blogosphere and empower independent writers with the visibility they deserve.
        </p>
        <p>
          We're building a powerful, interconnected ecosystem of thinkers, writers, and readers, helping creators monetise, get discovered, and connect on their own terms.
        </p>
        <p>
          In a world that rewards noise, BlogRolly rewards nuance.<br />
          In a culture obsessed with virality, we amplify value.<br />
          And in an internet dominated by algorithmic feeds and rented platforms, we return power to the hands of the writer.
        </p>
      </div>

      <div className={styles.rootsSection}>
        <h2>Our Roots:</h2>
        <p>Remember blogrolls?</p>
        <p>
          That small-but-powerful tradition where bloggers listed and linked to each other—not for clicks, but for community?<br />
          That's the spirit we're reviving.
        </p>
        <p>
          But not just the sidebar lists.<br />
          We're also bringing back the grand, curated blogroll directories that once served as hubs for discovering thoughtful blogs across every niche—before they quietly disappeared around 2007–2008, swept away by social media feeds, SEO obsession, and algorithmic dominance.
        </p>
        <p>
          Before timelines.<br />
          Before feeds.<br />
          Before followers.<br />
          There were blogrolls—organic, human-curated networks of voices that shaped internet culture.
        </p>
      </div>
    </Layout>
  );
};

export default About;
