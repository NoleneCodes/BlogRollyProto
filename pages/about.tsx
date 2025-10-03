import Link from "next/link";
import Layout from "../components/Layout";
import BlogrollTrendsChart from "../components/BlogrollTrendsChart";
import BlogrollyFlywheel from '../components/BlogrollyFlywheel';
import styles from "../styles/Home.module.css";


const About = () => {
  return (
    <Layout
      title="About - BlogRolly"
      description="Learn more about our mission to connect, empower, and grow independent blogs."
      canonical="https://blogrolly.com/about"
    >
      <div>
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
        <div className={styles.missionSection}>
          <h2>Your Mission as a Blogger</h2>
          <p>
            You started writing because you had something to share: ideas, insights, stories worth telling. But in today&apos;s internet, independent voices are too often buried under algorithms and noise.<br />
            You don&apos;t need to chase virality or bend to platform rules. You just need to be found by the right people.<br />
            That&apos;s where BlogRolly comes in.
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <BlogrollyFlywheel />
          </div>
          <p style={{ textAlign: 'center' }}>
            <strong style={{ color: '#c42142' }}>
              At the heart of BlogRolly is a simple idea: together, we rise.
            </strong>
          </p>
          <p>When you join, you contribute to a discovery loop that multiplies everyone’s reach:</p>
          <ol style={{ marginLeft: '1.5em', marginBottom: '1.5em' }}>
            <li>You add your blog → the network gains topic depth and authority.</li>
            <li>The network attracts more readers → you gain visibility and traffic.</li>
            <li>Links back to BlogRolly strengthen the network’s SEO → boosting your listing.</li>
            <li>More members join → the loop spins faster, lifting everyone higher.</li>
          </ol>
          <p>We&apos;re creating a mutual growth engine powered entirely by the blogs and creators within it.</p>
        </div>
        <div className={styles.missionSection}>
          <h2>Why BlogRolly Exists</h2>
          <p>Modern bloggers want to:</p>
          <ul style={{ listStyleType: 'none', marginLeft: '2em', paddingLeft: 0 }} className={styles.featureList}>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
              <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
              <span style={{ fontWeight: 500 }}>
                Attract <span style={{ color: '#c42142' }}>genuine readers</span>
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
              <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
              <span style={{ fontWeight: 500 }}>
                Build domain authority & <span style={{ color: '#c42142' }}>partnerships</span>
              </span>
            </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              <span style={{ color: '#c42142' }}>Monetise</span> on their own terms
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Connect without playing the <span style={{ color: '#c42142' }}>algorithm game</span>
            </span>
          </li>
        </ul>
        <p>But the reality is:</p>
        <ul style={{ listStyleType: 'none', marginLeft: '2em', paddingLeft: 0 }} className={styles.featureList}>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Social platforms reward <span style={{ color: '#c42142' }}>trends</span>, not craft
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              <span style={{ color: '#c42142' }}>SEO</span> is an uphill battle
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Independent voices get drowned out by <span style={{ color: '#c42142' }}>corporate content farms</span>
            </span>
          </li>
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
        <ul style={{ listStyleType: 'none', marginLeft: '2em', paddingLeft: 0 }} className={styles.featureList}>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Digital Sovereignty is Freedom → <span style={{ color: '#c42142' }}>You own your platform. We amplify it, not own it.</span>
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Craft Over Clout → <span style={{ color: '#c42142' }}>Your writing is your asset. We highlight quality, not hype.</span>
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Organic Growth, Authentically Earned → <span style={{ color: '#c42142' }}>No hacks, no gimmicks. Just meaningful reach.</span>
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Your Blog is Your Legacy → <span style={{ color: '#c42142' }}>We’re here for your long-term creative journey.</span>
            </span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <span style={{ color: '#c42142', fontSize: '1.2em', marginRight: '0.7em', fontWeight: 'bold' }}>•</span>
            <span style={{ fontWeight: 500 }}>
              Community is the New Network → <span style={{ color: '#c42142' }}>Every blog strengthens the whole.</span>
            </span>
          </li>
        </ul>
        <p>BlogRolly isn’t here to take your voice. We’re here to make sure it travels further.</p>
  </div>
      </div>
    </Layout>
  );
};

export default About;