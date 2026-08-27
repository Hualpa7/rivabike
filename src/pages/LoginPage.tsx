export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Ingresar</h1>
        {/* Formulario real (react-hook-form + zod + supabase.auth.signInWithPassword)
            se implementa en features/auth. */}
        <p className="text-sm text-ink/60">Formulario de login pendiente de implementar.</p>
      </div>
    </main>
  );
}
