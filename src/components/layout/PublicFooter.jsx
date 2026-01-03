import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Partners from './Partners';

const productLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'API', to: '/api' },
  { label: 'Integrations', to: '/integrations' }
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' }
];

const legalLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Security', to: '/security' }
];

export default function PublicFooter() {
  const renderLinks = (title, links) => (
    <div>
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-400" size={24} />
              <span className="text-xl font-bold text-white">Dexter</span>
            </div>
            <p className="text-sm">AI-powered content marketing for modern businesses</p>
          </div>
          {renderLinks('Product', productLinks)}
          {renderLinks('Company', companyLinks)}
          {renderLinks('Legal', legalLinks)}
        </div>
        
        <Partners />
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 Dexter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
