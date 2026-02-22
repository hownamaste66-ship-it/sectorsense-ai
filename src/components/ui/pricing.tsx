import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section className="relative overflow-hidden" id="pricing">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {title}
          </h2>
          <p className="mt-6 text-xl leading-8 text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        </div>

        <div className="flex w-full items-center justify-center space-x-2">
          <Switch
            ref={switchRef}
            id="interval"
            onCheckedChange={handleToggle}
          />
          <span className="inline-block whitespace-nowrap">
            <Label htmlFor="interval">
              Annual billing <span className="text-primary">(Save 20%)</span>
            </Label>
          </span>
        </div>

        <div className="mx-auto grid w-full justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: index * 0.1,
              }}
              className={cn(
                "relative flex flex-col gap-8 rounded-2xl border p-4 text-center lg:flex-1",
                plan.isPopular
                  ? "border-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                  : "border-border"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-medium text-primary-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Popular</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-4 p-2">
                <p className="text-lg font-bold text-muted-foreground">
                  {plan.name}
                </p>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-bold text-foreground">
                    <NumberFlow
                      value={Number(isMonthly ? plan.price : plan.yearlyPrice)}
                      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-muted-foreground">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="flex flex-col gap-2 font-normal">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-left text-sm font-medium text-muted-foreground"
                    >
                      <Check className="h-5 w-5 shrink-0 rounded-full bg-primary/10 p-1 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-transparent via-border to-transparent" />

                <Link
                  to={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.isPopular ? "default" : "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className="text-left text-xs text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
