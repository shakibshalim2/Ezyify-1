import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  const footerSections = [
    {
      title: 'About Ezyify',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Press', path: '/press' },
        { label: 'Blog', path: '/blog' },
        { label: 'Success Stories', path: '/success-stories' },
        { label: 'Investors', path: '/investors' },
      ],
    },
    {
      title: 'For Creators',
      links: [
        { label: 'Creator Center', path: '/creator-dashboard' },
        { label: 'Monetization', path: '/affiliate-manager' },
        { label: 'Creator Tools', path: '/upload' },
        { label: 'Analytics', path: '/creator-dashboard' },
        { label: 'Community Guidelines', path: '/community-guidelines' },
        { label: 'Creator Support', path: '/help' },
      ],
    },
    {
      title: 'For Sellers',
      links: [
        { label: 'Seller Dashboard', path: '/seller-dashboard' },
        { label: 'Start Selling', path: '/seller-dashboard' },
        { label: 'Seller University', path: '/help' },
        { label: 'Shipping', path: '/seller/logistics' },
        { label: 'Payment Terms', path: '/terms' },
        { label: 'Seller Protection', path: '/help' },
      ],
    },
    {
      title: 'For Buyers',
      links: [
        { label: 'How to Shop', path: '/help' },
        { label: 'Track Order', path: '/orders' },
        { label: 'Returns & Refunds', path: '/help' },
        { label: 'Buyer Protection', path: '/help' },
        { label: 'Gift Cards', path: '/shop' },
        { label: 'Deals & Coupons', path: '/shop' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Safety Center', path: '/safety' },
        { label: 'Community', path: '/explore' },
        { label: 'Report Issue', path: '/report-problem' },
        { label: 'FAQ', path: '/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'We value your privacy', path: '/privacy-preferences' },
        { label: 'Cookie Policy', path: '/privacy-preferences' },
        { label: 'Safety & Trust', path: '/safety-trust' },
        { label: 'Child Safety', path: '/child-safety' },
        { label: 'Copyright', path: '/copyright' },
        { label: 'Transparency', path: '/transparency' },
      ],
    },
  ];

  return (
    <footer style={{ background: '#080b14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* Top: Brand + Nav grid */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Brand column */}
          <div className="lg:w-64 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-brand-gradient">
                Ezyify
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Shop. Talk. Share. Live the Moment.<br />
              E-Commerce Social Media Ecosystem.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
                <Sparkles className="w-3 h-3 text-purple-400" />
                AI Powered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                50+ Countries
              </span>
            </div>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {footerSections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link to={link.path} className="text-sm transition-colors duration-150" style={{ color: 'rgba(255,255,255,0.5)' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)') }
                        onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Contact + Social + Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Contact</h4>
            <div className="space-y-2.5">
              {[
                { icon: Mail, text: 'support@ezyify.app' },
                { icon: Phone, text: '+1 (888) 234-5678' },
                { icon: MapPin, text: 'Global HQ, USA' },
                { icon: Globe, text: 'Available in 50+ Countries' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <Icon className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Follow Us</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {([
                [Facebook, 'Facebook', 'https://facebook.com/ezyify'],
                [Instagram, 'Instagram', 'https://instagram.com/ezyify'],
                [Twitter, 'X (Twitter)', 'https://x.com/ezyify'],
                [Youtube, 'YouTube', 'https://youtube.com/@ezyify'],
                [Linkedin, 'LinkedIn', 'https://linkedin.com/company/ezyify'],
              ] as const).map(([Icon, label, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Follow Ezyify on ${label}`}
                  className="p-3 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Newsletter</h4>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Get exclusive deals & updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" aria-label="Email for newsletter"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)' }}>
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <p className="text-sm text-center sm:text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Ezyify Inc. All rights reserved. E-Commerce Social Media Ecosystem.
          </p>
          <div className="flex items-center gap-2">
            {['English', 'USD $'].map((label) => (
              <button key={label} className="px-3 py-1.5 rounded-xl text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Trust + Payments */}
        <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-xs mr-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Secured by:</span>
            {['SSL Encrypted', 'PCI Compliant', 'GDPR Ready', 'ISO Certified'].map((b) => (
              <span key={b} className="px-2.5 py-1 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>{b}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs mr-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Payments:</span>
            {['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay', 'Venmo'].map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}