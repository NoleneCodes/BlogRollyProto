import Link from "next/link";
import Layout from "../components/Layout";
import BlogrollTrendsChart from "../components/BlogrollTrendsChart";
import BlogrollyFlywheel from '../components/BlogrollyFlywheel';
import styles from "../styles/About.module.css";

const About = () => {
  return (
    <Layout
      title="About - BlogRolly"
      description="Learn more about our mission to connect, empower, and grow independent blogs."
      canonical="https://blogrolly.com/about"
    >
      <div className={styles.pageWrapper}>
        <section className={styles.hero}>
          <h1 className={styles.title}>About BlogRolly</h1>
          <p className={styles.description}>
            Breaking Silos, Building A Network.
          </p>
        </section>
        
        <div className={styles.pronunciationCard}>
          <h3>Pronunciation: Blog-Roll-Lee</h3>
          <div className={styles.definition}>
            <strong>Definition:</strong><br />
            Blogroll — a list of hyperlinks to blogs or websites.
          </div>
        </div>
        
        <div className={styles.authRequiredSection}>
          <div className={styles.authContent}>
            <h2 className={styles.authTitle}>Your Mission as a Blogger</h2>
            <p className={styles.authDescription}>
              You started writing because you had something to share: ideas, insights, stories worth telling. But in today&apos;s internet, independent voices are too often buried under algorithms and noise.
            </p>
            <p className={styles.authDescription}>
              You don&apos;t need to chase virality or bend to platform rules. You just need to be found by the right people. That&apos;s where BlogRolly comes in.
            </p>
          </div>
        </div>
        
        <div className={styles.authRequiredSection}>
          <div className={styles.authContent}>
            <h2 className={styles.authTitle}>Our Mission: A Quiet Revolution for Indie Bloggers</h2>
            <p className={styles.authDescription}>
              BlogRolly exists to reconnect the fragmented blogosphere and give independent writers the visibility they deserve.
            </p>
            <p className={styles.authDescription}>
              We're building a network-powered ecosystem of thinkers, writers, and readers — one where creators own their platforms, grow their audiences, and amplify each other's reach.
            </p>
            <ul className={styles.featureList}>
              <li>In a world that rewards noise, we reward nuance.</li>
              <li>In a culture obsessed with feeds, we amplify value.</li>
              <li>In an internet dominated by rented platforms, we return power to the writer.</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.authRequiredSection}>
          <div className={styles.authContent}>
            <h2 className={styles.authTitle}>The BlogRolly Flywheel</h2>
            <div className={styles.flywheelContainer}>
              <BlogrollyFlywheel />
            </div>
            <p className={styles.flywheelTagline}>
              <strong className={styles.flywheelTaglineStrong}>
                At the heart of BlogRolly is a simple idea: together, we rise.
              </strong>
            </p>
            <p className={styles.authDescription}>When you join, you contribute to a discovery loop that multiplies everyone's reach:</p>
            <ol className={styles.orderedList}>
              <li>You add your blog → the network gains topic depth and authority.</li>
              <li>The network attracts more readers → you gain visibility and traffic.</li>
              <li>Links back to BlogRolly strengthen the network's SEO → boosting your listing.</li>
              <li>More members join → the loop spins faster, lifting everyone higher.</li>
            </ol>
            <p className={styles.authDescription}>We&apos;re creating a mutual growth engine powered entirely by the blogs and creators within it.</p>
          </div>
        </div>
        
        <div className={styles.authRequiredSection}>
          <div className={styles.authContent}>
            <h2 className={styles.authTitle}>Why BlogRolly Exists</h2>
            <p className={styles.authDescription}>Modern bloggers want to:</p>
            <div className={styles.reasonsGrid}>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Attract Genuine Readers</h4>
                <p className={styles.reasonText}>Connect with audiences who value your unique perspective</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Build Domain Authority</h4>
                <p className={styles.reasonText}>Grow partnerships and establish credibility in your niche</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Monetise on Their Terms</h4>
                <p className={styles.reasonText}>Generate revenue without compromising creative freedom</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Avoid Algorithm Games</h4>
                <p className={styles.reasonText}>Connect authentically without chasing platform trends</p>
              </div>
            </div>
            
            <p className={styles.authDescription}>But the reality is:</p>
            <div className={styles.reasonsGrid}>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Trends Over Craft</h4>
                <p className={styles.reasonText}>Social platforms reward viral content, not quality writing</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>SEO Struggles</h4>
                <p className={styles.reasonText}>Getting discovered organically is an uphill battle</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Corporate Competition</h4>
                <p className={styles.reasonText}>Independent voices get drowned out by content farms</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Platform Dependency</h4>
                <p className={styles.reasonText}>Building on rented digital land limits your control</p>
              </div>
            </div>
            
            <p className={styles.authDescription}>We're here to change that — by making sure your work is seen, credited, and connected to the audiences who value it most.</p>

            <div className={styles.signInButtonContainer}>
              <Link href="/submit" className={styles.signInButton}>
                Submit Your Blog
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.authRequiredSection}>
          <div className={styles.authContent}>
            <h2 className={styles.authTitle}>Our Values</h2>
            <p className={styles.authDescription}>
              The principles that guide everything we do at BlogRolly.
            </p>
            
            <div className={styles.reasonsGrid}>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Digital Sovereignty is Freedom</h4>
                <p className={styles.reasonText}>You own your platform. We amplify it, not own it.</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Craft Over Clout</h4>
                <p className={styles.reasonText}>Your writing is your asset. We highlight quality, not hype.</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Organic Growth, Authentically Earned</h4>
                <p className={styles.reasonText}>No hacks, no gimmicks. Just meaningful reach.</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Your Blog is Your Legacy</h4>
                <p className={styles.reasonText}>We're here for your long-term creative journey.</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Community is the New Network</h4>
                <p className={styles.reasonText}>Every blog strengthens the whole.</p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>Voice Amplification</h4>
                <p className={styles.reasonText}>We're here to make sure your voice travels further.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;