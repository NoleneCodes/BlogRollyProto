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
          Learn more about our mission to help you discover and organise your favourite blogs
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
        <h2>Our Mission:</h2> <h3>A Quiet Revolution for Indie Bloggers</h3>
        <p>
          BlogRolly has a simple mission:<br />
          To reconnect the fragmented blogosphere and empower independent writers with the visibility they deserve.
        </p>
        <p>
          We&apos;re building a powerful, interconnected ecosystem of thinkers, writers, and readers, helping creators monetise, get discovered, and connect on their own terms.
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
          That small-but-powerful tradition where bloggers listed and linked to each other&apos;not for clicks, but for community?<br />
          That&apos;s the spirit we&apos;re reviving.
        </p>
        <p>
          But not just the sidebar lists.<br />
          We&apos;re also bringing back the grand, curated blogroll directories that once served as hubs for discovering thoughtful blogs across every niche&apos;before they quietly disappeared around 2007&apos;2008, swept away by social media feeds, SEO obsession, and algorithmic dominance.
        </p>
        <p>
          Before timelines.<br />
          Before feeds.<br />
          Before followers.<br />
          There were blogrolls&apos;organic, human-curated networks of voices that shaped internet culture.
        </p>
      </div>

      <div className={styles.trendsSection}>
        <h2>The Data Speaks:</h2>
        <p>Google Trends shows the decline and quiet disappearance of &quot;blogroll&quot; searches over the past two decades:</p>
        <div className={styles.trendsChart}>
          <BlogrollTrendsChart />
          <p className={styles.trendsCaption}>
            Search interest in &quot;blogroll&quot; peaked in May 2007 at 100, then steadily declined to near zero by 2018, with occasional small spikes.
          </p>
        </div>
      </div>

      <div className={styles.rebuildSection}>
        <p>We&apos;re rebuilding that legacy.</p>
        <p>For today&apos;s creators. For tomorrow&apos;s internet.</p>
        <p>Not through popularity contests or viral dances, but through:</p>
        <ul className={styles.featureList}>
          <li>• Intentional discovery</li>
          <li>• Authentic writing</li>
          <li>• Genuine connections</li>
        </ul>
        <p>
          BlogRolly is the next-generation blogroll—an elegant, searchable evolution of a once-loved system, reborn for independent creators building real businesses with their words.
        </p>
        <p>BlogRolly combines modern discovery tools with the timeless appeal of personal blogs, creating a space where:</p>
        <ul className={styles.featureList}>
          <li>&#8226; Readers explore thoughtful content</li>
          <li>&#8226; Writers grow their brands</li>
          <li>&#8226; The open web stays open</li>
        </ul>
      </div>

      <div className={styles.whySection}>
        <h2>Why BlogRolly Exists:</h2>
        <p>Modern bloggers are underserved.</p>
        <p>They care deeply about:</p>
        <ul className={styles.featureList}>
          <li>&#8226; Owning their content</li>
          <li>&#8226; Attracting genuine readers</li>
          <li>&#8226; Building domain authority and brand partnerships</li>
          <li>&#8226; Monetising with ads, products, services, or affiliates</li>
          <li>&#8226; Connecting with others without playing the algorithm game</li>
        </ul>
        <p>But most platforms today force them to:</p>
        <ul className={styles.featureList}>
          <li>&#8226; Surrender ownership of their creations</li>
          <li>&#8226; Chase virality just to stay seen</li>
          <li>&#8226; Or become invisible without technical SEO mastery</li>
        </ul>
        <p>BlogRolly is the platform that says:</p>
        <p><strong>You don&apos;t need to go viral.</strong></p>
        <p><strong>You don&apos;t need to create ten versions of the same &quot;engaging content.&quot;</strong></p>
        <p><strong>You don&apos;t need to chase followers.</strong></p>
        <p><strong>You just need to write well, own your space, and be found by the right people.</strong></p>
        
        <div className={styles.submitCta}>
          <Link href="/submit" className={styles.submitButton}>
            Submit Your Blog
          </Link>
        </div>
        
        <p>
          Whether you&apos;re a niche blogger, a personal brand, or a digital writer building your first audience&apos;we&apos;re building this for you.
        </p>
        <p>BlogRolly is your amplifier, directory, and tribe&apos;all in one.</p>
      </div>

      <div className={styles.valuesSection}>
        <h2>Our Values</h2>
        
        <div className={styles.valueItem}>
          <h3>Digital Sovereignty is Freedom</h3>
          <p>You own your platform. We amplify it, not own it.</p>
        </div>
        
        <div className={styles.valueItem}>
          <h3>Craft Over Clout</h3>
          <p>Your writing is your asset. We highlight quality, not hype.</p>
        </div>
        
        <div className={styles.valueItem}>
          <h3>Organic Growth, Authentically Earned</h3>
          <p>No hacks, no trends. Just meaningful visibility to reach your people.</p>
        </div>
        
        <div className={styles.valueItem}>
          <h3>Your Blog is Your Legacy</h3>
          <p>We&apos;re here to support your long-term creative journey&apos;not just your trending moment.</p>
        </div>
        
        <div className={styles.valueItem}>
          <h3>Community is the New Network</h3>
          <p>We help rebuild strong blog-to-blog and writer-to-reader connections.</p>
        </div>
      </div>

      <div className={styles.contactSection}>
        <h2>Get In Touch</h2>
        <p>Have questions, suggestions, or just want to say hello?</p>
        <p>We&apos;d love to hear from you.</p>
        
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📧</span>
            <span>Email: <a href="mailto:hello@blogrolly.com">hello@blogrolly.com</a></span>
          </div>
          <div className={styles.contactItem}>
            <span>Follow us:</span>
            {/* Social media icons */}
            <div style={{ marginTop: '0.5rem' }}>
              {/* @ts-ignore-next-line */}
              {require('../components/SocialIcons').default()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;