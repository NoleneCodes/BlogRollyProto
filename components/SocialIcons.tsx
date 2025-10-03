import { FaTwitter, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

const SocialIcons = () => (
  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
    <a href="https://x.com/BlogRolly" target="_blank" rel="noopener noreferrer" title="Twitter/X"><FaTwitter size={24} /></a>
    <a href="https://www.instagram.com/blogrolly/" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram size={24} /></a>
    <a href="https://www.facebook.com/blogrolly" target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebook size={24} /></a>
    <a href="https://www.tiktok.com/@blogrolly" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok size={24} /></a>
  </div>
);

export default SocialIcons;
