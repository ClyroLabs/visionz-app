import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Camera, CreditCard, Landmark, Plus, Star, Trash2, Wallet } from "lucide-react";
import {
  Avatar, Badge, Button, Card, CardDescription, CardTitle, Input, Label, NetworkTag, Select, Switch, Tabs, TabsContent, TabsList, TabsTrigger,
  networks, useToast, type Network,
} from "@/index";
import { supabase } from "@/integrations/supabase/client";
import { cardBrand, cardLast4, pixKeySchema, profileSchema, walletAddressSchema } from "@/lib/account";

export const Route = createFileRoute("/app/conta")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Minha conta — VisionZ" },
      { name: "description", content: "Perfil, saldos, pagamentos e recebimentos da sua conta VisionZ." },
      { property: "og:title", content: "Minha conta — VisionZ" },
      { property: "og:description", content: "Gerencie sua conta VisionZ." },
    ],
  }),
  component: Account,
});

const money = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Account() {
  const { user } = Route.useRouteContext();
  const uid = user.id;
  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()).data,
  });
  const avatar = useQuery({
    queryKey: ["avatar", profile?.avatar_url],
    enabled: !!profile?.avatar_url,
    queryFn: async () => {
      const p = profile!.avatar_url!;
      if (p.startsWith("http")) return p;
      return (await supabase.storage.from("avatars").createSignedUrl(p, 3600)).data?.signedUrl ?? null;
    },
  });
  const name = profile?.nickname || profile?.full_name || user.email || "Você";

  return (
    <div className="space-y-8">
      <Card variant="featured" padding="lg" className="flex flex-col items-center gap-4 rounded-3xl text-center sm:flex-row sm:text-left">
        <Avatar size="lg" ring="brand" name={name} src={avatar.data ?? undefined} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold tracking-wide">Olá, {name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant="cyan">Dados de demonstração · nada é cobrado</Badge>
      </Card>
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="saldos">Saldos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="recebimentos">Recebimentos</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil"><ProfileTab uid={uid} profile={profile} avatarUrl={avatar.data ?? undefined} name={name} /></TabsContent>
        <TabsContent value="saldos"><BalancesTab uid={uid} /></TabsContent>
        <TabsContent value="pagamentos"><PaymentsTab uid={uid} /></TabsContent>
        <TabsContent value="recebimentos"><PayoutsTab uid={uid} /></TabsContent>
        <TabsContent value="preferencias"><PrefsTab uid={uid} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ id, label, children, error }: { id: string; label: string; children: ReactNode; error?: string }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

type Profile = { full_name: string | null; nickname: string | null; phone: string | null; birth_date: string | null; cpf: string | null; city: string | null; state: string | null; avatar_url: string | null } | null | undefined;

function ProfileTab({ uid, profile, avatarUrl, name }: { uid: string; profile: Profile; avatarUrl?: string; name: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const keys = ["full_name", "nickname", "phone", "birth_date", "cpf", "city", "state"] as const;
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (profile) setForm(Object.fromEntries(keys.map((k) => [k, profile[k] ?? ""]))); }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const p = profileSchema.safeParse(form);
      if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); throw new Error("invalid"); }
      setErrors({});
      const { error } = await supabase.from("profiles").upsert({ id: uid, ...p.data });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile", uid] }); toast({ title: "Perfil salvo", variant: "success" }); },
    onError: (e) => { if (e.message !== "invalid") toast({ title: "Não foi possível salvar", variant: "error" }); },
  });

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return toast({ title: "Envie uma imagem de até 5 MB", variant: "error" });
    const path = `${uid}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast({ title: "Falha no envio da foto", variant: "error" });
    await supabase.from("profiles").upsert({ id: uid, avatar_url: path });
    qc.invalidateQueries({ queryKey: ["profile", uid] });
    toast({ title: "Foto atualizada", variant: "success" });
  };

  const f = (k: (typeof keys)[number], label: string, extra: Record<string, string> = {}) => (
    <Field id={`p-${k}`} label={label} error={errors[k]}>
      <Input id={`p-${k}`} value={form[k] ?? ""} aria-invalid={!!errors[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...extra} />
    </Field>
  );

  return (
    <Card padding="lg" className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Avatar size="lg" name={name} src={avatarUrl} />
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border bg-surface-raised px-4 text-sm font-semibold hover:bg-magenta/10 hover:text-magenta">
          <Camera className="size-4" />Trocar foto
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        {f("full_name", "Nome completo", { autoComplete: "name", maxLength: "100" })}
        {f("nickname", "Apelido", { maxLength: "40" })}
        {f("phone", "Telefone", { inputMode: "tel", placeholder: "(85) 99999-9999" })}
        {f("birth_date", "Data de nascimento", { type: "date" })}
        {f("cpf", "CPF", { inputMode: "numeric", placeholder: "000.000.000-00" })}
        <div className="grid grid-cols-[1fr_6rem] gap-3">{f("city", "Cidade")}{f("state", "UF", { maxLength: "2", placeholder: "CE" })}</div>
        <div className="sm:col-span-2"><Button type="submit" loading={save.isPending} className="w-full sm:w-auto">Salvar alterações</Button></div>
      </form>
    </Card>
  );
}

function useTxs(uid: string) {
  return useQuery({
    queryKey: ["txs", uid],
    queryFn: async () => (await supabase.from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50)).data ?? [],
  });
}

function BalancesTab({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: txs = [] } = useTxs(uid);
  const prefs = usePrefs(uid);
  const bal = (cur: "BRL" | "VZN") => txs.filter((t) => t.currency === cur).reduce((s, t) => s + (t.direction === "in" ? 1 : -1) * Number(t.amount), 0);
  const brl = bal("BRL"), vzn = bal("VZN");
  const [amount, setAmount] = useState("");
  const add = useMutation({
    mutationFn: async (t: { label: string; amount: number; currency: "BRL" | "VZN"; direction: "in" | "out" }) => {
      const { error } = await supabase.from("wallet_transactions").insert({ user_id: uid, ...t });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["txs", uid] }),
  });
  const redeem = () => {
    const v = Number(amount.replace(",", "."));
    if (!(v > 0) || v > vzn) return toast({ title: "Valor inválido", description: "Informe um valor maior que zero e até o seu saldo.", variant: "error" });
    add.mutate({ label: "Resgate de recompensas (simulado)", amount: v, currency: "VZN", direction: "out" }, { onSuccess: () => { setAmount(""); toast({ title: `${money(v)} VZN resgatados (simulado)`, variant: "success" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="glass" padding="lg" className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="size-4" />Saldo em reais</span>
          <p className="font-display text-4xl font-bold">R$ {money(brl)}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {[20, 50, 100].map((v) => <Button key={v} size="sm" variant="soft" onClick={() => add.mutate({ label: `Depósito via Pix (simulado)`, amount: v, currency: "BRL", direction: "in" }, { onSuccess: () => toast({ title: `R$ ${v},00 adicionados (simulado)`, variant: "success" }) })}><Plus />R$ {v}</Button>)}
          </div>
        </Card>
        <Card variant="featured" padding="lg" className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="size-4" />Recompensas</span>{prefs.data && <NetworkTag network={prefs.data.network as Network} />}</div>
          <p className="font-display text-4xl font-bold">{money(vzn)} <span className="text-lg text-gradient-brand">$VZN</span></p>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); redeem(); }}>
            <Label htmlFor="b-a" className="sr-only">Valor em VZN</Label>
            <Input id="b-a" inputMode="decimal" placeholder="Valor em VZN" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button type="submit" loading={add.isPending}>Resgatar</Button>
          </form>
        </Card>
      </div>
      <Card padding="lg">
        <CardTitle className="mb-4 text-lg">Movimentações</CardTitle>
        {txs.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p> : (
          <ul className="divide-y">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${t.direction === "in" ? "bg-success/12 text-success" : "bg-ember/12 text-ember"}`}>{t.direction === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm">{t.label}</span><span className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span></span>
                <span className="shrink-0 font-mono text-sm">{t.direction === "in" ? "+" : "−"}{t.currency === "BRL" ? `R$ ${money(Number(t.amount))}` : `${money(Number(t.amount))} VZN`}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ListCard({ icon, title, subtitle, isDefault, onDefault, onDelete }: { icon: ReactNode; title: string; subtitle: string; isDefault: boolean; onDefault: () => void; onDelete: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-magenta/12 text-magenta [&_svg]:size-5">{icon}</span>
      <div className="min-w-0 flex-1"><p className="truncate font-semibold">{title}{isDefault && <Badge variant="brand" size="sm" className="ml-2 align-middle">Principal</Badge>}</p><p className="truncate font-mono text-xs text-muted-foreground">{subtitle}</p></div>
      <div className="flex gap-2">
        {!isDefault && <Button size="sm" variant="soft" onClick={onDefault}><Star />Tornar principal</Button>}
        <Button size="icon" variant="danger" aria-label="Remover" onClick={onDelete}><Trash2 /></Button>
      </div>
    </Card>
  );
}

function PaymentsTab({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data = [] } = useQuery({ queryKey: ["pm", uid], queryFn: async () => (await supabase.from("payment_methods").select("*").eq("user_id", uid).order("created_at")).data ?? [] });
  const [kind, setKind] = useState<"card" | "pix">("card");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["pm", uid] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    let row;
    if (kind === "card") {
      const last4 = cardLast4(value);
      if (!last4) return toast({ title: "Número de cartão inválido", variant: "error" });
      row = { kind, label: label.trim() || `Cartão ${cardBrand(value)}`, brand: cardBrand(value), last4 };
    } else {
      const p = pixKeySchema.safeParse(value);
      if (!p.success) return toast({ title: p.error.issues[0].message, variant: "error" });
      row = { kind, label: label.trim() || "Pix", pix_key: p.data };
    }
    const { error } = await supabase.from("payment_methods").insert({ user_id: uid, ...row, is_default: data.length === 0 });
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    setLabel(""); setValue(""); refresh(); toast({ title: "Forma de pagamento adicionada", variant: "success" });
  };
  const makeDefault = async (id: string) => {
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", uid);
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-4">
      <CardDescription className="text-center sm:text-left">Como você paga assinaturas e compras avulsas. Do cartão guardamos só a bandeira e os 4 últimos números.</CardDescription>
      {data.map((m) => <ListCard key={m.id} icon={m.kind === "card" ? <CreditCard /> : <Banknote />} title={m.label} subtitle={m.kind === "card" ? `${m.brand} •••• ${m.last4}` : `Pix · ${m.pix_key}`} isDefault={m.is_default} onDefault={() => makeDefault(m.id)} onDelete={async () => { await supabase.from("payment_methods").delete().eq("id", m.id); refresh(); }} />)}
      <Card padding="lg">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-end">
          <Field id="pm-k" label="Tipo"><Select id="pm-k" value={kind} onChange={(e) => { setKind(e.target.value as "card" | "pix"); setValue(""); }}><option value="card">Cartão</option><option value="pix">Pix</option></Select></Field>
          <Field id="pm-l" label="Apelido"><Input id="pm-l" value={label} maxLength={40} placeholder="Ex.: Cartão pessoal" onChange={(e) => setLabel(e.target.value)} /></Field>
          <Field id="pm-v" label={kind === "card" ? "Número do cartão" : "Chave Pix"}><Input id="pm-v" value={value} inputMode={kind === "card" ? "numeric" : "text"} autoComplete={kind === "card" ? "cc-number" : "off"} onChange={(e) => setValue(e.target.value)} /></Field>
          <Button type="submit"><Plus />Adicionar</Button>
        </form>
      </Card>
    </div>
  );
}

function PayoutsTab({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data = [] } = useQuery({ queryKey: ["po", uid], queryFn: async () => (await supabase.from("payout_accounts").select("*").eq("user_id", uid).order("created_at")).data ?? [] });
  const [kind, setKind] = useState<"pix" | "bank" | "wallet">("pix");
  const [f, setF] = useState({ label: "", pix_key: "", bank: "", agency: "", account: "", wallet_address: "", network: "polygon", min_withdraw: "50" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["po", uid] });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number(f.min_withdraw.replace(",", "."));
    if (!(min >= 10)) return toast({ title: "Saque mínimo deve ser de pelo menos R$ 10", variant: "error" });
    let row: Record<string, unknown> = { kind, min_withdraw: min };
    if (kind === "pix") {
      const p = pixKeySchema.safeParse(f.pix_key); if (!p.success) return toast({ title: p.error.issues[0].message, variant: "error" });
      row = { ...row, label: f.label.trim() || "Pix", pix_key: p.data };
    } else if (kind === "bank") {
      if (!f.bank.trim() || !/^\d{3,5}$/.test(f.agency) || !/^[\d-]{4,15}$/.test(f.account)) return toast({ title: "Preencha banco, agência e conta corretamente", variant: "error" });
      row = { ...row, label: f.label.trim() || f.bank.trim(), bank: f.bank.trim(), agency: f.agency, account: f.account };
    } else {
      const p = walletAddressSchema.safeParse(f.wallet_address); if (!p.success) return toast({ title: p.error.issues[0].message, variant: "error" });
      row = { ...row, label: f.label.trim() || "Carteira", wallet_address: p.data, network: f.network };
    }
    const { error } = await supabase.from("payout_accounts").insert({ user_id: uid, is_default: data.length === 0, ...row } as never);
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    setF({ ...f, label: "", pix_key: "", bank: "", agency: "", account: "", wallet_address: "" }); refresh();
    toast({ title: "Conta de recebimento adicionada", variant: "success" });
  };
  const makeDefault = async (id: string) => {
    await supabase.from("payout_accounts").update({ is_default: false }).eq("user_id", uid);
    await supabase.from("payout_accounts").update({ is_default: true }).eq("id", id);
    refresh();
  };
  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className="space-y-4">
      <CardDescription className="text-center sm:text-left">Para onde vão seus ganhos de criador e resgates de recompensas.</CardDescription>
      {data.map((p) => <ListCard key={p.id} icon={p.kind === "wallet" ? <Wallet /> : p.kind === "bank" ? <Landmark /> : <Banknote />} title={p.label}
        subtitle={(p.kind === "wallet" ? `${networks[(p.network ?? "polygon") as Network]?.label} · ${short(p.wallet_address ?? "")}` : p.kind === "bank" ? `Ag. ${p.agency} · Conta ${p.account}` : `Pix · ${p.pix_key}`) + ` · mín. R$ ${money(Number(p.min_withdraw))}`}
        isDefault={p.is_default} onDefault={() => makeDefault(p.id)} onDelete={async () => { await supabase.from("payout_accounts").delete().eq("id", p.id); refresh(); }} />)}
      <Card padding="lg">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <Field id="po-k" label="Tipo"><Select id="po-k" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}><option value="pix">Pix</option><option value="bank">Conta bancária</option><option value="wallet">Carteira blockchain</option></Select></Field>
          <Field id="po-l" label="Apelido"><Input id="po-l" value={f.label} maxLength={40} onChange={set("label")} /></Field>
          {kind === "pix" && <Field id="po-p" label="Chave Pix"><Input id="po-p" value={f.pix_key} onChange={set("pix_key")} /></Field>}
          {kind === "bank" && <>
            <Field id="po-b" label="Banco"><Input id="po-b" value={f.bank} maxLength={60} onChange={set("bank")} /></Field>
            <Field id="po-ag" label="Agência"><Input id="po-ag" inputMode="numeric" value={f.agency} onChange={set("agency")} /></Field>
            <Field id="po-ac" label="Conta"><Input id="po-ac" inputMode="numeric" value={f.account} onChange={set("account")} /></Field>
          </>}
          {kind === "wallet" && <>
            <Field id="po-w" label="Endereço da carteira"><Input id="po-w" className="font-mono" value={f.wallet_address} placeholder="0x…" onChange={set("wallet_address")} /></Field>
            <Field id="po-n" label="Rede"><Select id="po-n" value={f.network} onChange={set("network")}>{Object.entries(networks).map(([k, n]) => <option key={k} value={k}>{n.label}</option>)}</Select></Field>
          </>}
          <Field id="po-m" label="Saque mínimo (R$)"><Input id="po-m" inputMode="decimal" value={f.min_withdraw} onChange={set("min_withdraw")} /></Field>
          <Button type="submit" className="lg:col-span-1"><Plus />Adicionar</Button>
        </form>
      </Card>
    </div>
  );
}

function usePrefs(uid: string) {
  return useQuery({ queryKey: ["prefs", uid], queryFn: async () => (await supabase.from("user_preferences").select("*").eq("user_id", uid).maybeSingle()).data });
}

function PrefsTab({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const { data } = usePrefs(uid);
  const save = async (patch: Record<string, unknown>) => {
    const { error } = await supabase.from("user_preferences").upsert({ user_id: uid, ...data, ...patch } as never);
    if (error) return toast({ title: "Não foi possível salvar", variant: "error" });
    qc.invalidateQueries({ queryKey: ["prefs", uid] });
    toast({ title: "Preferência salva", variant: "success" });
  };
  if (!data) return <Card className="text-center text-muted-foreground">Carregando…</Card>;
  const row = (label: string, desc: string, k: "kids_default" | "notify_email" | "notify_push") => (
    <div className="flex items-center gap-4 py-4"><div className="flex-1"><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div><Switch checked={data[k]} aria-label={label} onCheckedChange={(v) => save({ [k]: v })} /></div>
  );
  return (
    <Card padding="lg" className="divide-y">
      {row("Modo infantil ao entrar", "Abre sempre com só conteúdos Livre e 10 anos.", "kids_default")}
      {row("Avisos por e-mail", "Novidades, recibos e ganhos.", "notify_email")}
      {row("Notificações no aparelho", "Lançamentos e recompensas.", "notify_push")}
      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <Field id="pf-l" label="Idioma"><Select id="pf-l" value={data.language} onChange={(e) => save({ language: e.target.value })}><option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="es">Español</option></Select></Field>
        <Field id="pf-n" label="Rede preferida para recompensas"><Select id="pf-n" value={data.network} onChange={(e) => save({ network: e.target.value })}>{Object.entries(networks).map(([k, n]) => <option key={k} value={k}>{n.label}</option>)}</Select></Field>
      </div>
    </Card>
  );
}
