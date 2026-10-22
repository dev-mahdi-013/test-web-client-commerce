import { SecretarySection } from "../components/SecretarySection";

/** Same layout shell as `HrPage`; data comes from `/ap/agents/20`. */
export function AssociationSecretariesPage() {
  return (
    <div className="grid max-w-full gap-6 overflow-x-hidden 2xl:grid-cols-2 2xl:gap-9">
      <SecretarySection />
    </div>
  );
}
