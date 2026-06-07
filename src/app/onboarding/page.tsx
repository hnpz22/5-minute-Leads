import { OrganizationList } from "@clerk/nextjs";

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Elige tu espacio de trabajo</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cada organización es un CRM independiente (ej. RobotSchool, Metron).
        </p>
      </div>
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
        skipInvitationScreen
      />
    </div>
  );
}
