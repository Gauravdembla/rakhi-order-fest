import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, Send, CheckCircle2, Copy, Download, LogOut } from "lucide-react";

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
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at: string;
  raw_payload: any;
};

const PROJECT_URL = "https://pmwnxcyltqbdziwufwxs.supabase.co";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { nav("/admin/login"); return; }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") { nav("/admin/login"); return; }
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      if (error.message.toLowerCase().includes("permission") || error.message.toLowerCase().includes("rls")) {
        nav("/admin/login");
      }
      return;
    }
    setOrders((data ?? []) as Order[]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    nav("/admin/login");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return [
        o.customer_name, o.customer_email, o.customer_phone,
        o.client_order_id, o.razorpay_payment_id, o.city,
      ].some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });
  }, [orders, status, search]);

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
      "razorpay_payment_id","razorpay_order_id",
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
                  <TableHead>Razorpay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No orders</TableCell></TableRow>
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
      </div>
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