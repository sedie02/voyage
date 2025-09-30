import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-8">
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        {/* Logo/Hero */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary-600">🌍 Voyage</h1>
          <p className="text-2xl text-gray-600">Slimme Reisplanner voor Groepen</p>
        </div>

        {/* Value Proposition */}
        <div className="space-y-2">
          <p className="mx-auto max-w-2xl text-lg text-gray-700">
            Plan je groepsreizen <strong>stressvrij en overzichtelijk</strong>. Dagplanning, polls,
            inpaklijsten en budget in één centrale app.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/trips/new"
            className="rounded-lg bg-primary-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-primary-700 hover:shadow-xl"
          >
            Start Nieuwe Trip
          </Link>
          <Link
            href="/trips"
            className="rounded-lg border-2 border-primary-600 bg-white px-8 py-4 font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            Mijn Trips
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon="📅"
            title="Dagplanning"
            description="Genereer slimme dagindelingen op basis van je voorkeuren"
          />
          <FeatureCard
            icon="🗳️"
            title="Polls"
            description="Beslis samen waar je heen gaat via stemmen"
          />
          <FeatureCard
            icon="🎒"
            title="Inpaklijst"
            description="Gedeelde checklist zodat niets vergeten wordt"
          />
          <FeatureCard icon="💰" title="Budget" description="Houd kosten bij en verdeel eerlijk" />
        </div>

        {/* PWA Install Hint */}
        <div className="pt-8 text-sm text-gray-500">
          💡 Tip: Installeer Voyage op je startscherm voor snelle toegang!
        </div>

        {/* Footer */}
        <footer className="pt-16 text-sm text-gray-400">
          <p>
            Ontwikkeld door Yassine Messaoudi & Sedäle Hoogvliets
            <br />
            HBO-ICT, Hogeschool Windesheim - PSEMO 2025
          </p>
        </footer>
      </div>
    </main>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
