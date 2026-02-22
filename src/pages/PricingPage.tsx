import { Pricing } from "@/components/ui/pricing";
import { Header } from "@/components/Header";

const plans = [
  {
    name: "STARTER",
    price: "50",
    yearlyPrice: "40",
    period: "per month",
    features: [
      "Up to 10 stock watchlists",
      "Basic market analytics",
      "48-hour support response time",
      "Limited API access",
      "Community support",
    ],
    description: "Perfect for individual investors getting started",
    buttonText: "Start Free Trial",
    href: "/",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: [
      "Unlimited watchlists",
      "Advanced AI-powered analytics",
      "24-hour support response time",
      "Full API access",
      "Priority support",
      "Real-time alerts",
      "Custom screeners",
    ],
    description: "Ideal for active traders and growing portfolios",
    buttonText: "Get Started",
    href: "/",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "299",
    yearlyPrice: "239",
    period: "per month",
    features: [
      "Everything in Professional",
      "Custom AI models",
      "Dedicated account manager",
      "1-hour support response time",
      "SSO Authentication",
      "Advanced security",
      "Custom contracts",
      "SLA agreement",
    ],
    description: "For institutions with specific requirements",
    buttonText: "Contact Sales",
    href: "/",
    isPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        <Pricing plans={plans} title="Premium Market Intelligence" description={"Unlock the full power of SectorSense AI\nAll plans include real-time data, AI insights, and dedicated support."} />
      </main>
    </div>
  );
}
