import { OfficerSection } from "../components/OfficerSection";
import { organizationsOfficerUnits } from "../config";

/** Panel of «مسئول تشکل‌ها»: appoints chamber poll agents through `/pao/agents/22`. */
export function OrganizationsHrPage() {
  return (
    <div className="grid max-w-full gap-6 overflow-x-hidden 2xl:grid-cols-2 2xl:gap-9">
      {organizationsOfficerUnits.map(({ unit, title }) => (
        <OfficerSection key={unit} title={title} unit={unit} />
      ))}
    </div>
  );
}
