import { OfficerSection } from "@/features/hr/components/OfficerSection";
import { associationOfficerUnits } from "@/features/hr/config";
import { currentAppRole } from "@/lib/commerce-scope";
import { SecretarySection } from "../components/SecretarySection";

/**
 * Same layout shell as `HrPage`; data comes from `/ap/agents/20` for secretaries and
 * `/ap/agents/23` for the association poll agents. Only the president may manage poll agents.
 */
export function AssociationSecretariesPage() {
  const canManagePollAgents = currentAppRole() === "association-head";

  return (
    <div className="grid max-w-full gap-6 overflow-x-hidden 2xl:grid-cols-2 2xl:gap-9">
      <SecretarySection />
      {canManagePollAgents &&
        associationOfficerUnits.map(({ unit, title }) => (
          <OfficerSection key={unit} title={title} unit={unit} />
        ))}
    </div>
  );
}
