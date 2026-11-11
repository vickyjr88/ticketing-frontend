import { Link } from 'react-router-dom';
import { LegalPage, Section, List } from './legal/LegalPage';
import { LEGAL } from './legal/legalInfo';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what personal data ${LEGAL.company} collects when you use ${LEGAL.site} and the ${LEGAL.appName} mobile app, why we collect it, and the choices you have.`}
    >
      <Section title="1. Who we are">
        <p>
          {LEGAL.company} ("we", "us") runs the ticketing platform at {LEGAL.site} and
          the {LEGAL.appName} app for Android and iOS (together, the "Service"). We are based
          in {LEGAL.location}. We are the data controller for the personal data described here,
          and we handle it in line with the Kenya Data Protection Act, 2019.
        </p>
      </Section>

      <Section title="2. Data we collect">
        <p><strong>Data you give us</strong></p>
        <List items={[
          'Account details: first and last name, email address, phone number and password (stored only as a secure hash).',
          'Orders and tickets: the events, ticket tiers and products you buy, order amounts, promo codes and your tickets\' QR codes.',
          'Payment details: the M-Pesa phone number you pay with and payment references. Card numbers are entered on Paystack or Stripe pages. We never see or store full card details.',
          'Messages you send us through the Contact page or the app, including your name, email, phone and message.',
          'If you create events: event details, images and the payout information you provide.',
        ]} />
        <p><strong>Data collected automatically</strong></p>
        <List items={[
          'Check-in records: when and at which gate a ticket was scanned.',
          'Technical data: IP address and browser or device type, recorded with contact messages and in server logs for security and fraud prevention.',
          'Website analytics: our website uses Google Tag Manager, which may set cookies to measure visits. The mobile app has no advertising or analytics trackers.',
          'Push notification token, if you allow notifications in the app.',
        ]} />
        <p>
          <strong>Camera:</strong> the app uses your camera only to read ticket QR codes on your
          device. Images are not saved or sent to us.
        </p>
      </Section>

      <Section title="3. How we use your data">
        <List items={[
          'To create and secure your account and sign you in.',
          'To process orders and payments and to issue, deliver and validate tickets.',
          'To send transactional messages such as order confirmations, tickets, password resets and important event updates (for example a time or venue change).',
          'To answer your questions and support requests.',
          'To prevent fraud, ticket duplication and misuse of the Service.',
          'To understand how the Service is used so we can improve it.',
          'To meet legal, tax and accounting obligations.',
        ]} />
        <p>
          We rely on performing our contract with you (selling and delivering tickets), our
          legitimate interests (security and improvement), your consent (for example, push
          notifications and analytics cookies), and legal obligations.
        </p>
      </Section>

      <Section title="4. Who we share data with">
        <p>We do not sell your personal data. We share it only with:</p>
        <List items={[
          'Payment processors that complete your payment: Safaricom (M-Pesa), Paystack and Stripe.',
          'Service providers that run the Service for us: Amazon Web Services (hosting and image storage), Brevo (email delivery) and Google Firebase (push notifications).',
          'The organiser of an event you buy tickets for, who receives the name and ticket details they need to run entry and contact attendees about that event.',
          'Authorities, when the law requires it, or to protect the rights and safety of our users or the public.',
        ]} />
        <p>
          Some providers may process data outside Kenya. Where they do, we rely on appropriate
          safeguards as required by the Data Protection Act.
        </p>
      </Section>

      <Section title="5. How long we keep data">
        <List items={[
          'Account data: while your account is open. When you delete your account, we delete or anonymise it within 30 days.',
          'Order and payment records: up to 7 years, as Kenyan tax and accounting law requires, even after you delete your account.',
          'Contact messages: up to 2 years after the conversation ends.',
          'Server logs: up to 90 days.',
        ]} />
      </Section>

      <Section title="6. Security">
        <p>
          All traffic to the Service is encrypted with HTTPS. Passwords are hashed, access to
          personal data is limited to staff who need it, and sign-in tokens in the app are kept
          in encrypted device storage. No system is perfectly secure, but we work to protect your
          data and will notify you and the Data Commissioner of a serious breach as the law requires.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>Under the Kenya Data Protection Act you can:</p>
        <List items={[
          'Access the personal data we hold about you.',
          'Correct inaccurate data. You can edit your name and phone number in your profile.',
          'Ask us to delete your data (see section 8).',
          'Object to or restrict certain processing, and withdraw consent at any time.',
          'Ask for a copy of your data in a portable format.',
        ]} />
        <p>
          To use any of these rights, <Link to="/contact" className="text-blue-600 underline">contact us</Link>.
          We will reply within 30 days. You can also complain to the Office of the Data Protection
          Commissioner (odpc.go.ke).
        </p>
      </Section>

      <Section id="delete" title="8. Deleting your account">
        <p>You can ask us to delete your account and personal data at any time:</p>
        <List items={[
          <>In the {LEGAL.appName} app: <strong>Profile → Delete my account</strong>.</>,
          <>On the web: follow the steps on our <Link to="/delete-account" className="text-blue-600 underline">Delete your account</Link> page, which sends the request through our Contact page.</>,
        ]} />
        <p>
          We delete your account within 30 days of the request. Tickets for upcoming events will
          stop working. Order and payment records we must keep by law are kept as described in section 5.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          The Service is not directed at children under 18, and we do not knowingly collect their
          data. If you believe a child has given us personal data, contact us and we will delete it.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this policy from time to time. We will change the effective date above
          and, for significant changes, let you know by email or in the app.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          {LEGAL.company}, {LEGAL.location}<br />
          Email: <a href={`mailto:${LEGAL.email}`} className="text-blue-600 underline">{LEGAL.email}</a><br />
          Phone: {LEGAL.phone}<br />
          Or use our <Link to="/contact" className="text-blue-600 underline">Contact page</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
