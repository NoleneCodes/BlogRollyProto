import Link from "next/link";
import Layout from "../components/Layout";
import BlogrollTrendsChart from "../components/BlogrollTrendsChart";
import styles from "../styles/Home.module.css";


const About = () => {
  return (
    <Layout title="About - BlogRolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>About BlogRolly</h1>
        <p className={styles.description}>
          Learn more about our mission to connect, empower, and grow independent blogs.
        </p>
      </div>

      <div className={styles.pronunciationCard}>
        <h3>Pronunciation: Blog-Roll-Lee</h3>
        <div className={styles.definition}>
          <strong>Definition:</strong><br />
          Blogroll — a list of hyperlinks to blogs or websites.
        </div>
      </div>

      <div className={styles.missionSection}>
        <h2>Your Mission as a Blogger</h2>
        <p>
          You started writing because you had something to share: ideas, insights, stories worth telling. But in today’s internet, independent voices are too often buried under algorithms and noise.<br />
          You don’t need to chase virality or bend to platform rules. You just need to be found by the right people.<br />
          That’s where BlogRolly comes in.
        </p>
      </div>

      <div className={styles.missionSection}>
        <h2>Our Mission: A Quiet Revolution for Indie Bloggers</h2>
        <p>
          BlogRolly exists to reconnect the fragmented blogosphere and give independent writers the visibility they deserve.<br />
          We’re building a network-powered ecosystem of thinkers, writers, and readers — one where creators own their platforms, grow their audiences, and amplify each other’s reach.
        </p>
        <ul className={styles.featureList}>
          <li>In a world that rewards noise, we reward nuance.</li>
          <li>In a culture obsessed with feeds, we amplify value.</li>
          <li>In an internet dominated by rented platforms, we return power to the writer.</li>
        </ul>
      </div>

      <div className={styles.missionSection}>
        <h2>The BlogRolly Flywheel</h2>
        <p>BlogRolly grows with you, not off you.</p>
        <p>When you join, you contribute to a discovery loop that multiplies everyone’s reach:</p>
        <ol style={{ marginLeft: '1.5em', marginBottom: '1.5em' }}>
          <li>You add your blog → the network gains topic depth and authority.</li>
          <li>The network attracts more readers → you gain visibility and traffic.</li>
          <li>Links back to BlogRolly strengthen the network’s SEO → boosting your listing.</li>
          <li>More members join → the loop spins faster, lifting everyone higher.</li>
        </ol>
        <p>It’s not charity — it’s infrastructure. A mutual growth engine powered entirely by the blogs within it.</p>
      </div>

      <div className={styles.missionSection}>
        <h2>Why BlogRolly Exists</h2>
        <p>Modern bloggers want to:</p>
        <ul className={styles.featureList}>
          <li>Own their content</li>
          <li>Attract genuine readers</li>
          <li>Build domain authority & partnerships</li>
          <li>Monetise on their own terms</li>
          <li>Connect without playing the algorithm game</li>
        </ul>
        <p>But the reality is:</p>
        <ul className={styles.featureList}>
          <li>Social platforms reward trends, not craft</li>
          <li>SEO is an uphill battle</li>
          <li>Independent voices get drowned out by corporate content farms</li>
        </ul>
        <p>We’re here to change that — by making sure your work is seen, credited, and connected to the audiences who value it most.</p>

        <div className={styles.submitCta}>
          <Link href="/submit" className={styles.submitButton}>
            Submit Your Blog
          </Link>
        </div>
       
      </div>

      <div className={styles.valuesSection}>
        <h2>Our Values</h2>
        <ul className={styles.featureList}>
          <li>Digital Sovereignty is Freedom → You own your platform. We amplify it, not own it.</li>
          <li>Craft Over Clout → Your writing is your asset. We highlight quality, not hype.</li>
          <li>Organic Growth, Authentically Earned → No hacks, no gimmicks. Just meaningful reach.</li>
          <li>Your Blog is Your Legacy → We’re here for your long-term creative journey.</li>
          <li>Community is the New Network → Every blog strengthens the whole.</li>
        </ul>
        <p>BlogRolly isn’t here to take your voice. We’re here to make sure it travels further.</p>
      </div>
    </Layout>
  );
};

export default About;