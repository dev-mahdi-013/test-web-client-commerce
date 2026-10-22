import { officerUnits } from "../config";
import { OfficerSection } from "../components/OfficerSection";

export function HrPage() {
  return (
    <div className="grid max-w-full gap-6 overflow-x-hidden 2xl:grid-cols-2 2xl:gap-9">
      {officerUnits.map(({ unit, title }) => (
        <OfficerSection key={unit} title={title} unit={unit} />
      ))}
    </div>
  );
}
