import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { NewsletterSignup } from './newsletter-signup';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61580246143943' },
  { name: 'Twitter', icon: Twitter, href: 'https://x.com/Bulletinb176163' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/thebulletinbriefs/' },
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@thebulletinbriefs' },
];

const footerLinksConfig = {
  company: [
    { key: 'aboutUs', href: '/about' },
    { key: 'contact', href: '/contact' },
    { key: 'editorialGuidelines', href: '/editorial-guidelines' },
    { key: 'rssFeed', href: '/rss' },
  ],
  legal: [
    { key: 'privacyPolicy', href: '/privacy' },
    { key: 'termsOfService', href: '/terms' },
    { key: 'cookiePolicy', href: '/cookies' },
    { key: 'disclaimer', href: '/disclaimer' },
  ],
  sections: [
    { key: 'politics', href: '/category/politics' },
    { key: 'technology', href: '/category/tech' },
    { key: 'business', href: '/category/business' },
    { key: 'sports', href: '/category/sports' },
  ],
};

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12">
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>

        <Separator />

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="TheBulletinBriefs Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-bold text-xl">TheBulletinBriefs</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{t('footer.email')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{t('footer.phone')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              {footerLinksConfig.company.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.sections')}</h3>
            <ul className="space-y-3">
              {footerLinksConfig.sections.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              {footerLinksConfig.legal.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TheBulletinBriefs. {t('footer.rights')}
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}