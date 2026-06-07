import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const features = [
  {
    title: "Bandeja omnicanal",
    body: "WhatsApp, Instagram y web caen en una sola bandeja. Ningún lead se pierde entre apps.",
    icon: "💬",
  },
  {
    title: "Respuesta en <5 min",
    body: "Un agente con IA acusa recibo y califica al instante. La velocidad de respuesta multiplica tu conversión hasta 9×.",
    icon: "⚡",
  },
  {
    title: "Pipeline que cierra",
    body: "Funnel visual con etapas y criterios claros. Sabes exactamente dónde está cada deal y qué sigue.",
    icon: "📈",
  },
  {
    title: "Lead scoring",
    body: "Cada contacto puntúa por fit e intención. Tu equipo ataca primero a los que de verdad van a comprar.",
    icon: "🎯",
  },
];

const steps = [
  { n: "01", title: "Conecta tus canales", body: "Vinculas WhatsApp e Instagram en minutos. Los mensajes empiezan a entrar solos." },
  { n: "02", title: "La IA responde y califica", body: "Acuse inmediato, primera pregunta de cualificación y score. Tu comercial toma el control cuando importa." },
  { n: "03", title: "Cierras más rápido", body: "El deal avanza por el pipeline con seguimiento automático. Tú te enfocas en vender, no en perseguir." },
];

export default async function Home() {
  const { userId } = await auth();
  const primaryHref = userId ? "/dashboard" : "/sign-up";
  const primaryLabel = userId ? "Ir al panel" : "Empezar gratis";

  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-line bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            5-minute<span className="text-ink-muted"> Leads</span>
          </span>
          <nav className="flex items-center gap-3 text-sm">
            {userId ? (
              <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 font-medium text-cream hover:opacity-90">
                Panel
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="font-medium text-ink-soft hover:text-ink">
                  Entrar
                </Link>
                <Link href="/sign-up" className="rounded-md bg-ink px-4 py-2 font-medium text-cream hover:opacity-90">
                  Empezar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-lime-soft px-3 py-1 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-lime-deep" /> CRM omnicanal con agente reactivo
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Responde a cada lead en{" "}
          <span className="relative whitespace-nowrap">
            <span className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-lime" />
            <span className="relative">menos de 5 minutos</span>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          Captura los leads de WhatsApp e Instagram, respóndelos al instante con IA y
          llévalos por tu funnel hasta el cierre. Todo en un solo lugar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primaryHref}
            className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-cream shadow-hard transition-transform hover:-translate-y-0.5"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-ink bg-cream px-6 py-3 text-sm font-semibold hover:bg-cream-alt"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Stat row */}
        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
          {[
            { v: "9×", l: "más conversión respondiendo rápido" },
            { v: "<5 min", l: "tiempo objetivo de respuesta" },
            { v: "24/7", l: "el agente nunca duerme" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-line bg-white p-4">
              <div className="text-3xl font-bold tracking-tight">{s.v}</div>
              <div className="mt-1 text-xs text-ink-muted">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-cream-alt">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Todo el ciclo del lead, en una herramienta
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-ink-soft">
            Lo que usan las grandes para no perder ventas — sin pagar un SaaS carísimo.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-ink bg-white p-5 shadow-hard-sm"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">Cómo funciona</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-bold text-lime-deep">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-2xl bg-ink px-8 py-14 text-center text-cream">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Deja de perder leads por responder tarde
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/70">
            Empieza gratis y conecta tu primer canal hoy.
          </p>
          <Link
            href={primaryHref}
            className="mt-7 inline-block rounded-md bg-lime px-7 py-3 text-sm font-semibold text-ink shadow-hard transition-transform hover:-translate-y-0.5"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-ink-muted">
          © {2026} 5-minute Leads · Hecho para cerrar más rápido.
        </div>
      </footer>
    </div>
  );
}
