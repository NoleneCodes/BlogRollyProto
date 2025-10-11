import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabFounder = () => (
  <div className={styles.dashboardCard}>
    <h2>Meet the Founder</h2>
    <div className={styles.founderBio}>
      <h3>Nolene – Why Me, Why Now</h3>
      <p>Hi, I&apos;m Nolene, the founder of BlogRolly.</p>
      <p>As a researcher, and solo builder, I&apos;ve lived the silence that fell over the open web. I&apos;ve seen incredible creators publish great content&apos;only for it to disappear into the void.</p>
      <p>I started BlogRolly because I believe in digital sovereignty and the power of long-form thought. I want to make the web feel interconnected again not just performative and feed-based.</p>
      <p>With a background in [briefly list highlights, e.g. regulatory systems, content strategy, tech upskilling], I&apos;ve bootstrapped the MVP with no outside funding and designed a product informed by both cultural insight and user empathy.</p>
      <p><strong>I&apos;m building BlogRolly not to go viral but to last.</strong></p>
    </div>
  </div>
);

export default DashboardTabFounder;
