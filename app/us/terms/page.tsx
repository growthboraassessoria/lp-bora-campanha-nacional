import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";

export const metadata: Metadata = { title: "Terms" };

export default function UsTerms() {
  return (
    <>
      <Header locale="us" />
      <main>
        <div className="page">
          <p className="eyebrow">BORA, Let&apos;s Go</p>
          <Headline as="h1" lines={["CAMPAIGN", "TERMS."]} size="m" />

          <h2>Signing up</h2>
          <p>Signing up for the campaign is free and there is no charge. It registers your interest in having BORA in your city and counts toward your city&apos;s and your state&apos;s ranking. You must be at least 13 years old to sign up.</p>

          <h2>The ranking</h2>
          <p>The ranking shows how many people signed up in each city. The first goal of 100 people per city is a reference point. Whether and when BORA starts activities in a city is BORA&apos;s decision and depends on other factors. Signing up does not guarantee that BORA will operate in your city.</p>

          <h2>The referral link</h2>
          <p>Each person gets a personal link. Sign-ups made through that link count for the city and for the person who referred them. Duplicate sign-ups, sign-ups made on behalf of other people, and automated sign-ups don&apos;t count and may be removed.</p>

          <h2>Communication</h2>
          <p>We may contact you about the campaign and about BORA in your city using the mobile number and email you provided. We send marketing text messages only if you opted in. You can opt out at any time.</p>

          <h2>Changes</h2>
          <p>BORA may adjust the campaign rules. Relevant changes are posted on this page.</p>

          <h2>Data credits</h2>
          <p>ZIP code data from GeoNames (geonames.org), licensed under CC BY 4.0. State boundaries from the U.S. Census Bureau.</p>
        </div>
      </main>
      <Footer locale="us" />
    </>
  );
}
