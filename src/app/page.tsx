import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          CRM Omnicanal
        </h1>
        <p className="text-lg text-zinc-500">
          Captura, responde y cierra leads de WhatsApp e Instagram en un solo lugar.
          Respuesta en menos de 5 minutos con un agente reactivo.
        </p>
      </div>
      <div className="flex gap-4">
        {userId ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Ir al panel
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50"
            >
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
