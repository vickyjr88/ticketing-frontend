import { Link } from 'react-router-dom';
import { LegalPage, Section, List } from './legal/LegalPage';
import { LEGAL } from './legal/legalInfo';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms apply when you use ${LEGAL.site} or the ${LEGAL.appName} app to browse events, buy tickets or products, or run events. By creating an account or making a purchase you agree to them.`}
    >
      <Section title="1. About the Service">
        <p>
          The Service is operated by {LEGAL.company}, {LEGAL.location}. We provide the platform
          that sells and validates tickets. Unless we say otherwise, each event is organised by
          the event organiser named on the event page, and the organiser is responsible for the
          event itself.
        </p>
      </Section>

      <Section title="2. Your account">
        <List items={[
          'You must be at least 18, or have a parent or guardian\'s permission, to buy tickets.',
          'Give accurate details and keep your password secret. You are responsible for activity on your account.',
          'Tell us straight away if you think someone else has used your account.',
          'We may suspend accounts used for fraud, ticket touting or abuse of the Service.',
        ]} />
      </Section>

      <Section title="3. Buying tickets and products">
        <List items={[
          'Prices are shown in Kenya Shillings (KES) unless stated otherwise and include any fees shown at checkout.',
          'An order is confirmed only after payment succeeds. You will then see your tickets in My Tickets and receive a confirmation email.',
          'Payments are processed by M-Pesa, Paystack or Stripe under their own terms.',
          'Layaway (pay over time) orders are confirmed only when paid in full by the stated deadline. Otherwise they may be cancelled under the terms shown at checkout.',
          'Promo codes have their own conditions, cannot be exchanged for cash, and may be withdrawn.',
        ]} />
      </Section>

      <Section title="4. Tickets and entry">
        <List items={[
          'Each ticket has a unique QR code that can be scanned only once. Keep it private. Anyone holding the code may be admitted in your place.',
          'Tickets you share or transfer through the Service move to the new holder.',
          'Reselling tickets above face value, or copying or altering tickets, is not allowed, and such tickets may be cancelled without a refund.',
          'Organisers and venues may refuse entry for safety reasons, for breaking venue rules, or where the law requires it.',
          'Free or lottery tickets are subject to the rules shown on the event page.',
        ]} />
      </Section>

      <Section title="5. Cancellations and refunds">
        <List items={[
          'Tickets are non-refundable unless the event is cancelled, or the organiser\'s refund policy on the event page says otherwise.',
          'If an event is cancelled, you will be refunded the ticket price through the original payment method or as the organiser announces.',
          'If an event is postponed or materially changed, your ticket stays valid for the new date. Where a refund is offered, we will tell you how to claim it.',
          <>To request a refund, use our <Link to="/contact" className="text-blue-600 underline">Contact page</Link> and choose "Refund Request".</>,
        ]} />
      </Section>

      <Section title="6. Event organisers">
        <p>If you create events on the Service, you agree to:</p>
        <List items={[
          'Give accurate event information and honour every ticket sold.',
          'Hold any licences and permits the event needs.',
          'Use attendee data only to run your event, in line with the Data Protection Act.',
          'Handle refunds for events you cancel or materially change.',
        ]} />
      </Section>

      <Section title="7. Acceptable use">
        <p>You must not:</p>
        <List items={[
          'Use bots or automated tools to buy tickets or scrape the Service.',
          'Try to break, overload or get around the security of the Service.',
          'Upload unlawful, misleading or infringing content.',
          'Use the Service to commit fraud or to harm others.',
        ]} />
      </Section>

      <Section title="8. Liability">
        <p>
          We provide the Service "as is". As far as the law allows, we are not liable for indirect
          or consequential losses, or for the acts of event organisers, venues or payment
          providers. Our total liability for any claim relating to a purchase is limited to the
          amount you paid for that purchase. Nothing in these terms limits rights you have under
          the Kenya Consumer Protection Act.
        </p>
      </Section>

      <Section title="9. Ending your account">
        <p>
          You can stop using the Service at any time and <Link to="/delete-account" className="text-blue-600 underline">delete your account</Link>.
          We may suspend or end access if you break these terms.
        </p>
      </Section>

      <Section title="10. Changes and governing law">
        <p>
          We may update these terms. Material changes will be announced on the site or in the app
          before they take effect. These terms are governed by the laws of Kenya, and disputes
          are subject to the courts of Kenya.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about these terms? Email{' '}
          <a href={`mailto:${LEGAL.email}`} className="text-blue-600 underline">{LEGAL.email}</a>{' '}
          or use our <Link to="/contact" className="text-blue-600 underline">Contact page</Link>.
          See also our <Link to="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
