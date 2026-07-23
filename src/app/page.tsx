import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { Positioning } from "@/components/landing/Positioning";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductionLine } from "@/components/landing/ProductionLine";
import { Differentials } from "@/components/landing/Differentials";
import { Productions } from "@/components/landing/Productions";
import { EditorPreview } from "@/components/landing/EditorPreview";
import { Security } from "@/components/landing/Security";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-nexo-black">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Positioning />
        <HowItWorks />
        <ProductionLine />
        <Differentials />
        <Productions />
        <EditorPreview />
        <Security />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
