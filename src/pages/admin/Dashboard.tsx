import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RefreshCw, Send, CheckCircle2, Copy, Download, LogOut, Key, Plus, Trash2, Truck, Users, Lock, X, ChevronLeft, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  client_order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  pincode: string | null;
  chakra_qty: number;
  prosperity_qty: number;
  hooponopono_qty: number;
  total_qty: number;
  amount: number;
  currency: string;
  status: string;
  dispatch_status: string;
  awb_number: string | null;
  courier: string | null;
  dispatched_at: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at: string;
  raw_payload: any;
};

const PROJECT_URL = "https://pmwnxcyltqbdziwufwxs.supabase.co";
const WEBHOOK_URL = `${PROJECT_URL}/functions/v1/razorpay-payment-match`;

type WebhookKey = {
  id: string;
  name: string;
  secret: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type Member = { user_id: string; email: string; role: string; created_at: string };
const FN = (name: string) => `${PROJECT_URL}/functions/v1/${name}`;

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [keys, setKeys] = useState<WebhookKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreated, setJustCreated] = useState<WebhookKey | null>(null);
  const [role, setRole] = useState<string>("team");
  const [dispatchFilter, setDispatchFilter] = useState<string>("all");
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [awb, setAwb] = useState("");
  const [courier, setCourier] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberCreds, setMemberCreds] = useState<{ email: string; password: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { nav("/admin/login"); return; }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") { nav("/admin/login"); return; }
      const { data: me } = await supabase
        .from("admin_users").select("role").eq("user_id", data.session.user.id).maybeSingle();
      const myRole = (me as any)?.role ?? "team";
      setRole(myRole);
      await load();
      if (myRole === "owner") await Promise.all([loadKeys(), loadMembers()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callTeam(payload: any) {
    const { data: sess } = await supabase.auth.getSession();
    const res = await fetch(FN("admin-team"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token}` },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async function loadMembers() {
    const body = await callTeam({ action: "list" });
    if (body?.ok) setMembers(body.members as Member[]);
  }

  async function addMember() {
    const email = newMemberEmail.trim();
    if (!email) { toast.error("Enter an email"); return; }
    const body = await callTeam({ action: "create", email, role: "team" });
    if (!body?.ok) { toast.error(body?.error ?? "Failed"); return; }
    setMemberCreds({ email: body.email, password: body.password });
    setNewMemberEmail("");
    loadMembers();
    toast.success("Team member created. Copy the password now.");
  }

  async function resetMemberPassword(m: Member) {
    if (!confirm(`Generate a new password for ${m.email}?`)) return;
    const body = await callTeam({ action: "reset_password", user_id: m.user_id });
    if (!body?.ok) { toast.error(body?.error ?? "Failed"); return; }
    setMemberCreds({ email: m.email, password: body.password });
    toast.success("New password generated.");
  }

  async function removeMember(m: Member) {
    if (!confirm(`Remove ${m.email}'s admin access?`)) return;
    const body = await callTeam({ action: "remove", user_id: m.user_id });
    if (!body?.ok) { toast.error(body?.error ?? "Failed"); return; }
    toast.success("Access removed.");
    loadMembers();
  }

  async function changeMyPassword() {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    setNewPassword("");
    toast.success("Password updated.");
  }

  function openDispatch(o: Order) {
    setDispatchOrder(o);
    setAwb(o.awb_number ?? "");
    setCourier(o.courier ?? "");
  }

  async function saveDispatch() {
    if (!dispatchOrder) return;
    if (!awb.trim()) { toast.error("AWB number is required."); return; }
    setBusyId(dispatchOrder.id);
    const { error } = await supabase.from("orders").update({
      dispatch_status: "dispatched",
      awb_number: awb.trim(),
      courier: courier.trim() || null,
      dispatched_at: new Date().toISOString(),
    }).eq("id", dispatchOrder.id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as dispatched.");
    setDispatchOrder(null);
    load();
  }

  async function undoDispatch(o: Order) {
    if (!confirm("Mark this order as not dispatched?")) return;
    setBusyId(o.id);
    const { error } = await supabase.from("orders").update({
      dispatch_status: "not_dispatched", awb_number: null, courier: null, dispatched_at: null,
    }).eq("id", o.id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Dispatch cleared.");
    load();
  }

  async function deleteOrder(o: Order) {
    if (!confirm(`Delete the order for ${o.customer_name} (₹${Number(o.amount).toLocaleString("en-IN")})? This cannot be undone.`)) return;
    setBusyId(o.id);
    const { error } = await supabase.from("orders").delete().eq("id", o.id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Order deleted.");
    load();
  }

  async function load() {
    setLoading(true);
    const pageSize = 1000;
    const all: Order[] = [];
    for (let page = 0; ; page++) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (error) {
        setLoading(false);
        toast.error(error.message);
        if (error.message.toLowerCase().includes("permission") || error.message.toLowerCase().includes("rls")) {
          nav("/admin/login");
        }
        return;
      }
      all.push(...((data ?? []) as Order[]));
      if (!data || data.length < pageSize) break;
    }
    setLoading(false);
    setOrders(all);
  }

  async function loadKeys() {
    const { data, error } = await supabase
      .from("webhook_keys")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setKeys((data ?? []) as WebhookKey[]);
  }

  function generateSecret() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return "whk_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function createKey() {
    const name = newKeyName.trim() || `Key ${new Date().toLocaleString("en-IN")}`;
    const secret = generateSecret();
    const { data: sess } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("webhook_keys")
      .insert({ name, secret, created_by: sess.user?.id })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setJustCreated(data as WebhookKey);
    setNewKeyName("");
    loadKeys();
    toast.success("API key generated. Copy it now — it won't be shown again in full.");
  }

  async function revokeKey(k: WebhookKey) {
    if (!confirm(`Revoke "${k.name}"? Requests using it will start failing.`)) return;
    const { error } = await supabase.from("webhook_keys")
      .update({ revoked_at: new Date().toISOString() }).eq("id", k.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Key revoked.");
    loadKeys();
  }

  async function deleteKey(k: WebhookKey) {
    if (!confirm(`Delete "${k.name}" permanently?`)) return;
    const { error } = await supabase.from("webhook_keys").delete().eq("id", k.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Key deleted.");
    loadKeys();
  }

  async function signOut() {
    await supabase.auth.signOut();
    nav("/admin/login");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (dispatchFilter !== "all" && (o.dispatch_status ?? "not_dispatched") !== dispatchFilter) return false;
      if (!q) return true;
      return [
        o.customer_name, o.customer_email, o.customer_phone, o.awb_number,
        o.client_order_id, o.razorpay_payment_id, o.city,
      ].some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });
  }, [orders, status, dispatchFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filtered, currentPage, perPage],
  );

  useEffect(() => { setPage(1); }, [status, dispatchFilter, search, perPage]);

  const todayStats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday = (d: string) => new Date(d) >= today;
    const t = orders.filter((o) => isToday(o.created_at));
    return {
      drafts: t.filter((o) => o.status === "draft").length,
      pending: t.filter((o) => o.status === "pending").length,
      success: t.filter((o) => o.status === "success").length,
      revenue: t.filter((o) => o.status === "success").reduce((a, o) => a + Number(o.amount || 0), 0),
    };
  }, [orders]);

  async function resendWebhook(o: Order) {
    setBusyId(o.id);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch(`${PROJECT_URL}/functions/v1/notify-order-webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: "manual_resend", ...o }),
      });
      const body = await res.json();
      if (body?.ok) toast.success("Sent to Pabbly.");
      else toast.error(`Pabbly status ${body?.status ?? "unknown"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusyId(null);
    }
  }

  async function markSuccess(o: Order) {
    setBusyId(o.id);
    const { error } = await supabase.from("orders").update({ status: "success" }).eq("id", o.id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as success.");
    load();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied.");
  }

  function exportCsv() {
    const cols = [
      "created_at","status","client_order_id","customer_name","customer_email","customer_phone",
      "city","pincode","chakra_qty","prosperity_qty","hooponopono_qty","total_qty","amount",
      "razorpay_payment_id","razorpay_order_id","dispatch_status","awb_number","courier","dispatched_at",
    ];
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [cols.join(",")].concat(filtered.map((o) => cols.map((c) => esc((o as any)[c])).join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const statusColor = (s: string) =>
    s === "success" ? "default" : s === "pending" ? "secondary" : "outline";

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Angels On Earth — admin dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Drafts today" value={todayStats.drafts} />
          <StatCard label="Pending today" value={todayStats.pending} />
          <StatCard label="Success today" value={todayStats.success} />
          <StatCard label="Revenue today" value={`₹${todayStats.revenue.toLocaleString("en-IN")}`} />
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="Search name / email / phone / order id"
              value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dispatchFilter} onValueChange={setDispatchFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dispatch</SelectItem>
                <SelectItem value="not_dispatched">Not dispatched</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground self-center ml-auto">
              {filtered.length} of {orders.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cart</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dispatch</TableHead>
                  <TableHead>Razorpay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No orders</TableCell></TableRow>
                ) : filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="font-medium">{o.customer_name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{o.customer_email}</div>
                      <div className="text-muted-foreground">{o.customer_phone}</div>
                    </TableCell>
                    <TableCell className="text-xs">{o.city ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div>C:{o.chakra_qty} · P:{o.prosperity_qty} · H:{o.hooponopono_qty}</div>
                      <div className="text-muted-foreground">Total: {o.total_qty}</div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">₹{Number(o.amount).toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge variant={statusColor(o.status) as any}>{o.status}</Badge></TableCell>
                    <TableCell className="text-xs">
                      {o.dispatch_status === "dispatched" ? (
                        <div className="space-y-0.5">
                          <Badge variant="default">dispatched</Badge>
                          <div className="font-mono">{o.awb_number}</div>
                          <div className="text-muted-foreground">{o.courier ?? "—"}</div>
                        </div>
                      ) : <Badge variant="outline">not dispatched</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.razorpay_payment_id ? (
                        <button className="underline" onClick={() => copy(o.razorpay_payment_id!)}>{o.razorpay_payment_id.slice(0, 14)}…</button>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => resendWebhook(o)} title="Resend to Pabbly">
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                        {o.status !== "success" && (
                          <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => markSuccess(o)} title="Mark as success">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={busyId === o.id}
                          onClick={() => o.dispatch_status === "dispatched" ? openDispatch(o) : openDispatch(o)}
                          title={o.dispatch_status === "dispatched" ? "Edit AWB" : "Mark dispatched"}>
                          <Truck className="w-3.5 h-3.5" />
                        </Button>
                        {o.dispatch_status === "dispatched" && (
                          <Button size="sm" variant="ghost" disabled={busyId === o.id} onClick={() => undoDispatch(o)} title="Clear dispatch">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => copy(o.client_order_id)} title="Copy order id">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-4 space-y-4 max-w-md">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <h2 className="font-semibold">Change my password</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Input type="password" placeholder="New password (min 8 chars)" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} className="max-w-xs" />
            <Button size="sm" onClick={changeMyPassword}>Update</Button>
          </div>
        </Card>

        {role === "owner" && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <h2 className="font-semibold">Team members</h2>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Input placeholder="team.member@example.com" value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)} className="max-w-xs" />
            <Button size="sm" onClick={addMember}><Plus className="w-4 h-4 mr-1" />Add team member</Button>
          </div>
          {memberCreds && (
            <div className="p-3 rounded-md border border-primary/40 bg-primary/5 space-y-2">
              <div className="text-sm font-medium">Credentials for {memberCreds.email} — copy now:</div>
              <div className="flex gap-2 items-center flex-wrap">
                <code className="px-2 py-1 bg-background rounded text-xs break-all flex-1 min-w-0">{memberCreds.password}</code>
                <Button size="sm" variant="outline" onClick={() => copy(memberCreds.password)}>
                  <Copy className="w-3.5 h-3.5 mr-1" />Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMemberCreds(null)}>Dismiss</Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell className="text-sm">{m.email}</TableCell>
                    <TableCell><Badge variant={m.role === "owner" ? "default" : "secondary"}>{m.role}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(m.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => resetMemberPassword(m)}>Reset password</Button>
                        {m.role !== "owner" && (
                          <Button size="sm" variant="ghost" onClick={() => removeMember(m)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        )}

        {role === "owner" && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <h2 className="font-semibold">Payment webhook API</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground">POST endpoint (send Razorpay success events here):</div>
            <div className="flex gap-2 items-center flex-wrap">
              <code className="px-2 py-1 bg-muted rounded text-xs break-all flex-1 min-w-0">{WEBHOOK_URL}</code>
              <Button size="sm" variant="outline" onClick={() => copy(WEBHOOK_URL)}>
                <Copy className="w-3.5 h-3.5 mr-1" />Copy URL
              </Button>
            </div>
            <div className="text-muted-foreground mt-3">
              Send the API key in the <code className="text-xs">x-webhook-secret</code> header.
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center pt-2 border-t">
            <Input
              placeholder="Key name (e.g. Razorpay live)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="max-w-xs"
            />
            <Button size="sm" onClick={createKey}><Plus className="w-4 h-4 mr-1" />Generate new API key</Button>
          </div>

          {justCreated && (
            <div className="p-3 rounded-md border border-primary/40 bg-primary/5 space-y-2">
              <div className="text-sm font-medium">New key created — copy it now:</div>
              <div className="flex gap-2 items-center flex-wrap">
                <code className="px-2 py-1 bg-background rounded text-xs break-all flex-1 min-w-0">{justCreated.secret}</code>
                <Button size="sm" variant="outline" onClick={() => copy(justCreated.secret)}>
                  <Copy className="w-3.5 h-3.5 mr-1" />Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setJustCreated(null)}>Dismiss</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Secret</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">No API keys yet — generate one above.</TableCell></TableRow>
                ) : keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="text-xs font-mono">{k.secret.slice(0, 8)}…{k.secret.slice(-4)}</TableCell>
                    <TableCell className="text-xs">{new Date(k.created_at).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-xs">{k.last_used_at ? new Date(k.last_used_at).toLocaleString("en-IN") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={k.revoked_at ? "outline" : "default"}>{k.revoked_at ? "revoked" : "active"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        {!k.revoked_at && (
                          <Button size="sm" variant="outline" onClick={() => revokeKey(k)} title="Revoke">Revoke</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteKey(k)} title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        )}
      </div>

      <Dialog open={!!dispatchOrder} onOpenChange={(o) => !o && setDispatchOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark dispatched</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {dispatchOrder?.customer_name} · ₹{Number(dispatchOrder?.amount ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="space-y-1">
              <Label htmlFor="awb">AWB / tracking number</Label>
              <Input id="awb" value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="e.g. 1234567890" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="courier">Courier (optional)</Label>
              <Input id="courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Delhivery, BlueDart" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchOrder(null)}>Cancel</Button>
            <Button onClick={saveDispatch}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </Card>
  );
}