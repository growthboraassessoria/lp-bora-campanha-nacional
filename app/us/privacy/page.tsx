import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";

export const metadata: Metadata = { title: "Privacy notice" };

export default function UsPrivacy() {
  return (
    <>
      <Header locale="us" />
      <main>
        <div className="page">
          <p className="eyebrow">BORA, Let&apos;s Go</p>
          <Headline as="h1" lines={["PRIVACY", "NOTICE."]} size="m" />
          <p>This notice explains, in plain language, what BORA does with the information you share in the &quot;BORA, Let&apos;s Go&quot; campaign in the United States.</p>

          <h2>Who we are</h2>
          <p>The campaign is run by Bora Assessoria LTDA, a company based in Belo Horizonte, Brazil. You can reach us at comercial@boraassessoria.com.</p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Sign-up:</strong> first and last name, mobile number, email, and ZIP code.</li>
            <li><strong>From your ZIP code:</strong> your city and state, so your city counts in the ranking. We don&apos;t store your street address.</li>
            <li><strong>About you:</strong> date of birth and sex. We use your date of birth to confirm it&apos;s you when you sign in, and both to organize training groups and race categories.</li>
            <li><strong>Optional:</strong> answers about how you run, your goal, your club, and where you work, if you choose to answer.</li>
            <li><strong>Member area:</strong> you sign in with your mobile number and date of birth and can update your details and add a photo, another phone number, and your Instagram. Your photo stays in our storage for as long as your profile exists.</li>
            <li><strong>Public profile:</strong> only if you turn it on. It shows your first name, last initial, photo, Instagram, and one-liner on your city&apos;s page. A text-message button appears only if you allow it, and anyone who taps it will see your number. You can turn it off at any time.</li>
            <li><strong>Browser location:</strong> only if you allow it, to show where you are on the map on the home page. Your position stays on your device. We record only the state, for statistics.</li>
            <li><strong>Page usage:</strong> events such as a sign-up started, a link shared, and clicks, in aggregate, to improve the campaign.</li>
          </ul>

          <h2>What we use it for</h2>
          <ul>
            <li>To count how many people want BORA in each city and state.</li>
            <li>To create your BORA ID and your digital card, with a QR code that opens your personal link.</li>
            <li>To contact you about BORA in your city.</li>
            <li>To credit referrals to your personal link.</li>
          </ul>

          <h2>Text messages</h2>
          <p>We send marketing text messages only if you checked the box to receive them when you signed up. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Agreeing to receive texts is not a condition of any purchase.</p>

          <h2>Who we share it with</h2>
          <p>The service providers we use to store data, send messages, and measure the campaign. We don&apos;t sell your personal information.</p>

          <h2>Where it&apos;s processed</h2>
          <p>Your information is processed in the United States and in Brazil.</p>

          <h2>How long we keep it</h2>
          <p>For as long as the campaign runs and for the time needed for BORA to reach your city. You can ask us to delete it at any time.</p>

          <h2>Your choices</h2>
          <p>You can ask to access, correct, or delete your information, and stop our communications, by emailing comercial@boraassessoria.com. Depending on where you live, state law may give you additional rights.</p>

          <h2>Children</h2>
          <p>The campaign is not directed to children under 13, and we don&apos;t knowingly collect their information.</p>
        </div>
      </main>
      <Footer locale="us" />
    </>
  );
}
