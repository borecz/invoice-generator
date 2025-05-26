import { useTranslations } from "next-intl";

/**
 * Custom hook to handle array translations in next-intl
 * Since useTranslations with returnObjects: true is unreliable,
 * this hook provides a safe way to retrieve arrays from translation files
 */
export function useTranslationArrays() {
  const t = useTranslations();

  const getTranslationArray = (
    key: string,
    knownIndices: number[]
  ): string[] => {
    const items: string[] = [];

    for (const index of knownIndices) {
      try {
        const itemKey = `${key}.${index}`;
        const translation = t(itemKey);
        if (translation && typeof translation === "string") {
          items.push(translation);
        }
      } catch (error) {
        // Skip missing translations
        console.warn(`Missing translation for key: ${key}.${index}`);
      }
    }

    return items;
  };

  const getPricingFeatures = (
    planType: "free" | "pro" | "enterprise"
  ): string[] => {
    // Define the exact indices that exist for each plan
    const knownIndices = {
      free: [0, 1, 2, 3], // 4 features
      pro: [0, 1, 2, 3, 4, 5], // 6 features
      enterprise: [0, 1, 2, 3, 4, 5], // 6 features
    };

    const fallbackFeatures = {
      free: [
        "Up to 5 invoices per month",
        "Basic invoice templates",
        "Email support",
        "Payment tracking",
      ],
      pro: [
        "Unlimited invoices",
        "Custom branding",
        "Advanced reporting",
        "Priority support",
        "Payment reminders",
        "Multi-currency support",
      ],
      enterprise: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
      ],
    };

    try {
      const features = getTranslationArray(
        `landing.pricing.${planType}.features`,
        knownIndices[planType]
      );

      // If we got some features, return them, otherwise use fallback
      return features.length > 0 ? features : fallbackFeatures[planType];
    } catch (error) {
      console.warn(
        `Error loading pricing features for ${planType}, using fallback`
      );
      return fallbackFeatures[planType];
    }
  };

  return {
    getTranslationArray,
    getPricingFeatures,
  };
}
