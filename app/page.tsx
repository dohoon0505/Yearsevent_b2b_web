import { Hero } from "@/components/sections/Hero";
import { AboutStrip } from "@/components/sections/AboutStrip";
import { StrengthsGrid } from "@/components/sections/StrengthsGrid";
import { Web3Showcase } from "@/components/sections/Web3Showcase";
import { AgencyWarning } from "@/components/sections/AgencyWarning";
import { Achievements } from "@/components/sections/Achievements";
import { PartnersList } from "@/components/sections/PartnersList";
import { NewsTeaser } from "@/components/sections/NewsTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutStrip />
      <StrengthsGrid />
      <Web3Showcase />
      <AgencyWarning />
      <Achievements />
      <PartnersList />
      <NewsTeaser />
      <ContactCTA />
    </>
  );
}
