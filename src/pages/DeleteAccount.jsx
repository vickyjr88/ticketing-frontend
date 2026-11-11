import { Link } from 'react-router-dom';
import { Smartphone, Globe, Trash2 } from 'lucide-react';
import { LegalPage, Section, List } from './legal/LegalPage';
import { LEGAL } from './legal/legalInfo';

export const DELETION_PREFIX = 'ACCOUNT DELETION REQUEST';

export default function DeleteAccount() {
  return (
    <LegalPage
      title="Delete your account"
      intro={`How to permanently delete your ${LEGAL.appName} / ${LEGAL.site} account and personal data.`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <h3 className="mt-3 font-semibold text-gray-900">In the app</h3>
          <p className="mt-1 text-sm">
            Open {LEGAL.appName}, sign in, then go to <strong>Profile → Delete my account</strong> and confirm.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="mt-3 font-semibold text-gray-900">On the web</h3>
          <p className="mt-1 text-sm">
            Send a deletion request through our Contact page. The button below fills the form in for you.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/contact?topic=delete-account"
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Request account deletion
        </Link>
        <p className="mt-3 text-sm text-gray-500">
          Use the email address registered to your account so we can verify the request.
        </p>
      </div>

      <Section title="What gets deleted">
        <List items={[
          'Your profile: name, email address, phone number and password.',
          'Your tickets, saved preferences and push notification tokens.',
          'Your Contact page messages, once any open request is resolved.',
        ]} />
      </Section>

      <Section title="What we keep, and for how long">
        <List items={[
          'Order and payment records (amount, date, payment reference) for up to 7 years, as Kenyan tax and accounting law requires. They are no longer linked to an active account.',
          'Anonymous, aggregated statistics (for example, how many tickets an event sold) that do not identify you.',
        ]} />
      </Section>

      <Section title="Timing">
        <p>
          We confirm your request by email and delete your account within <strong>30 days</strong>.
          Tickets for upcoming events stop working once your account is deleted, so transfer or use
          them first.
        </p>
        <p>
          Questions? Email <a href={`mailto:${LEGAL.email}`} className="text-blue-600 underline">{LEGAL.email}</a>.
          See our <Link to="/privacy#delete" className="text-blue-600 underline">Privacy Policy</Link> for details.
        </p>
      </Section>
    </LegalPage>
  );
}
