import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/experience/i18n";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button, Card, Input, Label, Logo } from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — VisionZ" },
      { name: "description", content: "Entre ou crie sua conta VisionZ para gerenciar perfil, saldos e pagamentos." },
      { property: "og:title", content: "Entrar — VisionZ" },
      { property: "og:description", content: "Acesse sua conta VisionZ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email("E-mail inválido").max(255), password: z.string().min(8, "Mínimo de 8 caracteres").max(72) });

function AuthPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (session) navigate({ to: "/app/conta", replace: true }); }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ email, password });
    if (!p.success) return setMsg({ ok: false, text: p.error.issues[0].message });
    setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      if (error) setMsg({ ok: false, text: "E-mail ou senha incorretos." });
    } else {
      const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() || undefined } } });
      if (error) setMsg({ ok: false, text: error.message });
      else if (!data.session) setMsg({ ok: true, text: "Conta criada! Confira seu e-mail para confirmar o cadastro." });
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (r.error) setMsg({ ok: false, text: "Não foi possível entrar com o Google." });
  };

  return (
    <main className="relative grid min-h-screen place-items-center bg-background bg-stage-glow px-4 py-10">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <Card variant="glass" padding="lg" className="w-full max-w-md space-y-6 rounded-3xl">
        <Link to="/site" className="mx-auto flex w-fit items-center gap-2.5"><Logo brand="visionz-symbol" alt="" className="h-9 w-auto drop-shadow-[0_0_10px_var(--magenta)]" /><span className="font-display text-lg font-bold tracking-[0.12em]">VISIONZ</span></Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie seu perfil, saldos e pagamentos.</p>
        </div>
        <Button variant="secondary" className="w-full" onClick={google}>
          <svg viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M21.8 10.2H12v3.9h5.6c-.5 2.5-2.7 4-5.6 4a6.1 6.1 0 1 1 0-12.2c1.5 0 2.9.6 4 1.5l2.9-2.9A10 10 0 1 0 12 22c5.5 0 10-4 10-10 0-.6-.1-1.2-.2-1.8Z" /></svg>
          Continuar com Google
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou com e-mail<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && <div className="space-y-1.5"><Label htmlFor="a-n">Nome</Label><Input id="a-n" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" /></div>}
          <div className="space-y-1.5"><Label htmlFor="a-e">E-mail</Label><Input id="a-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
          <div className="space-y-1.5"><Label htmlFor="a-p">Senha</Label><Input id="a-p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} required /></div>
          {msg && <p role="status" className={msg.ok ? "text-sm text-success" : "text-sm text-destructive"}>{msg.text}</p>}
          <Button type="submit" className="w-full" loading={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "in" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button type="button" className="font-semibold text-magenta hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>{mode === "in" ? "Criar conta" : "Entrar"}</button>
        </p>
      </Card>
    </main>
  );
}
