import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL } from './legalInfo';

export function LegalPage({ title, intro, children }) {
  useEffect(() => {
    document.title = `${title} | ${LEGAL.company}`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Legal</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Effective {LEGAL.effectiveDate}</p>
        {intro && <p className="mt-4 text-lg text-gray-700 leading-relaxed">{intro}</p>}
      </header>
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
        {children}
      </article>
      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
        <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
        <Link to="/delete-account" className="hover:text-blue-600">Delete your account</Link>
        <Link to="/contact" className="hover:text-blue-600">Contact us</Link>
      </nav>
    </div>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function List({ items }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
