import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Heart, Gift, Plus, Minus, ArrowRight, RefreshCw } from "lucide-react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
// Razorpay checkout removed — payment now redirects to external checkout links
import rakhi1 from "@/assets/rakhi-1.webp.asset.json";
import rakhi2 from "@/assets/rakhi-2.webp.asset.json";
import rakhi3 from "@/assets/rakhi-3.webp.asset.json";
import rakhi4 from "@/assets/rakhi-4.webp.asset.json";
import rakhi5 from "@/assets/rakhi-5.webp.asset.json";
import rakhi6 from "@/assets/rakhi-6.webp.asset.json";
import rakhi7 from "@/assets/rakhi-7.webp.asset.json";
import chakraBanner from "@/assets/chakra-banner.webp.asset.json";
import hooponoBanner from "@/assets/hoopono-banner.webp.asset.json";
import pricingBanner from "@/assets/pricing-banner.webp.asset.json";
import threeRakhisBanner from "@/assets/three-rakhis-banner.webp.asset.json";
import prosperityBanner from "@/assets/prosperity-banner.webp.asset.json";
import { supabase } from "@/integrations/supabase/client";

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type RecentOrder = { name: string; city: string; qty: number };

type RakhiDescProps = {
  emoji: string;
  title: string;
  short: string;
  more: React.ReactNode;
  size?: "sm" | "md";
};
const RakhiDescription = ({ emoji, title, short, more, size = "sm" }: RakhiDescProps) => {
  const [open, setOpen] = useState(false);
  const headingCls = size === "md" ? "text-xl font-semibold text-foreground mb-3" : "text-lg font-semibold text-foreground mb-2";
  const textCls = size === "md" ? "text-muted-foreground leading-relaxed" : "text-muted-foreground text-sm leading-relaxed";
  return (
    <div>
      <h3 className={headingCls}>{emoji} {title}</h3>
      {open ? (
        <p className={textCls}>{short}</p>
      ) : (
        <div className={`${textCls} flex items-baseline gap-2`}>
          <span className="truncate min-w-0">{short}</span>
          <button
            onClick={() => setOpen(true)}
            className="text-primary font-medium hover:underline text-sm whitespace-nowrap shrink-0"
          >
            Read more...
          </button>
        </div>
      )}
      {open && (
        <div className="mt-2 space-y-2">
          {more}
          <button
            onClick={() => setOpen(false)}
            className="text-primary font-medium hover:underline text-sm"
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [rakhi1Quantity, setRakhi1Quantity] = useState<number>(0);
  const [rakhi2Quantity, setRakhi2Quantity] = useState<number>(0);
  const [testQuantity, setTestQuantity] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [inventory, setInventory] = useState({ chakra: 0, prosperity: 0 });
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"items" | "details">("items");

  // Simulated live availability per rakhi — randomly fluctuates between 10 and 15
  const [availability, setAvailability] = useState({
    chakra: randomBetween(10, 15),
    prosperity: randomBetween(10, 15),
    hooponopono: randomBetween(10, 15),
  });
  useEffect(() => {
    const id = setInterval(() => {
      setAvailability({
        chakra: randomBetween(10, 15),
        prosperity: randomBetween(10, 15),
        hooponopono: randomBetween(10, 15),
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Social proof ticker
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [socialProof, setSocialProof] = useState<{
    name: string; city: string; qty: number; visible: boolean;
  }>({ name: "", city: "", qty: 0, visible: false });

  // Fetch real recent orders, then refresh every 60s to pick up new ones
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("recent-orders");
        if (cancelled) return;
        if (error) {
          console.warn("[recent-orders] invoke error:", error);
          return;
        }
        const orders = (data?.orders ?? []) as RecentOrder[];
        if (orders.length) setRecentOrders(orders);
      } catch (e) {
        console.warn("[recent-orders] fetch failed:", e);
      }
    };
    load();
    const refresh = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  // Cycle through real orders in the toast
  useEffect(() => {
    if (recentOrders.length === 0) return;
    let idx = Math.floor(Math.random() * recentOrders.length);
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      const o = recentOrders[idx % recentOrders.length];
      idx += 1;
      setSocialProof({ name: o.name, city: o.city, qty: o.qty, visible: true });
      hideTimer = setTimeout(
        () => setSocialProof((p) => ({ ...p, visible: false })),
        4500
      );
    };
    const first = setTimeout(show, 2000);
    const cycle = setInterval(show, 8000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(cycle);
    };
  }, [recentOrders]);

  const totalQuantity = rakhi1Quantity + rakhi2Quantity + testQuantity;
  const countryCodes = [
    { code: "+91", label: "🇮🇳 +91" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+44", label: "🇬🇧 +44" },
    { code: "+971", label: "🇦🇪 +971" },
    { code: "+61", label: "🇦🇺 +61" },
    { code: "+65", label: "🇸🇬 +65" },
    { code: "+49", label: "🇩🇪 +49" },
    { code: "+33", label: "🇫🇷 +33" },
    { code: "+81", label: "🇯🇵 +81" },
  ];
  
  const getPricing = (quantity: number) => {
    const prices: Record<number, number> = {
      1: 299, 2: 499, 3: 699, 4: 899, 5: 1099,
      6: 1299, 7: 1499, 8: 1699, 9: 1899, 10: 1999,
    };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const grandTotalItems = totalQuantity;
  const totalAmount = totalQuantity > 0 ? getPricing(totalQuantity) : 0;

  // Stable client_order_id for this browser session — reused for draft autosave
  // AND for the final "Proceed to pay" write, so the upsert on client_order_id
  // simply flips the same row from draft → pending.
  const clientOrderIdRef = useRef<string>(
    `rakhi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  // Debounced draft autosave — persists customer details + current cart while
  // the user is filling the checkout form, so we never lose their info even if
  // they abandon or the final record-order call fails.
  useEffect(() => {
    const nameOk = customerName.trim().length >= 2;
    const phoneOk = /^\d{10,15}$/.test(customerPhone.trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
    // Only start saving once we have a name AND (email or phone) — avoids junk rows.
    if (!nameOk || (!phoneOk && !emailOk)) return;

    const handle = setTimeout(() => {
      void supabase.functions
        .invoke("record-order", {
          body: {
            client_order_id: clientOrderIdRef.current,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_phone: customerPhone.trim(),
            address1: address1.trim(),
            address2: address2.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            chakra_qty: rakhi1Quantity,
            prosperity_qty: rakhi2Quantity,
            hooponopono_qty: testQuantity,
            total_qty: grandTotalItems,
            amount: totalAmount,
            currency: "INR",
            status: "draft",
          },
        })
        .catch((e) => console.warn("[record-order draft] failed:", e));
    }, 800);
    return () => clearTimeout(handle);
  }, [
    customerName,
    customerEmail,
    customerPhone,
    address1,
    address2,
    city,
    pincode,
    rakhi1Quantity,
    rakhi2Quantity,
    testQuantity,
    grandTotalItems,
    totalAmount,
  ]);

  const rakhiImages = [
    threeRakhisBanner.url, // 1. Hero overview of all 3 rakhis
    chakraBanner.url,      // 2. 7 Chakra product banner
    hooponoBanner.url,     // 3. Ho'oponopono product banner
    prosperityBanner.url,  // 4. Prosperity product banner
    rakhi1.url,            // 5. Lifestyle / detail shots
    rakhi2.url,
    rakhi3.url,
    rakhi4.url,
    rakhi5.url,
    rakhi6.url,
    rakhi7.url,
    pricingBanner.url,     // 11. Pricing / bundle offer as closing CTA
  ];

  // Google Sheets integration with multiple fallback methods
  const fetchInventoryFromSheets = async () => {
    console.log('🔄 Starting to fetch inventory from Google Sheets...');
    try {
      const sheetId = "1zcVxd3iwlwDGoHtDo4pyLUXIkLu5jIcaLtj12xSKEuE";
      
      // Multiple URL formats to try
      const urls = [
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`
      ];
      
      let lastError;
      
      for (const url of urls) {
        try {
          console.log(`🌐 Trying URL: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'text/csv,text/plain,*/*',
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log(`📡 Response status: ${response.status}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const text = await response.text();
          console.log('📄 CSV Response received:', text.substring(0, 200) + '...');
          
          // Parse CSV response - find row 2 and get columns B and C
          const lines = text.split('\n').filter(line => line.trim());
          console.log(`📋 Total CSV lines: ${lines.length}`);
          
          if (lines.length >= 2) {
            const row2 = lines[1]; // Second row (index 1)
            console.log('📊 Row 2 data:', row2);
            
            const columns = row2.split(',');
            console.log('🔢 All columns:', columns);
            
            // Get B2 and C2 values (index 1 and 2, since A is index 0)
            const chakraQty = parseInt(columns[1]?.replace(/['"]/g, '').trim()) || 0;
            const prosperityQty = parseInt(columns[2]?.replace(/['"]/g, '').trim()) || 0;
            
            console.log('✅ Successfully parsed quantities:');
            console.log(`   🌈 7 Chakra Rakhi (B2): ${chakraQty}`);
            console.log(`   💰 Prosperity Rakhi (C2): ${prosperityQty}`);
            
            // Setting inventory to 2 for both products
            setInventory({ chakra: 2, prosperity: 2 });
            console.log('✅ Inventory set to 2 for both products');
            return; // Success - exit the function
          }
          
          throw new Error('Invalid CSV format or no data found');
          
        } catch (urlError) {
          console.log(`❌ URL failed: ${url}`, urlError);
          lastError = urlError;
          continue; // Try next URL
        }
      }
      
      throw lastError || new Error('All URLs failed');
      
    } catch (error) {
      console.error('🚨 Error fetching inventory from Google Sheets:', error);
      console.log('🔄 Using manual inventory values - please refresh to try again');
      
      // Setting inventory to 2 for both products
      setInventory({ chakra: 2, prosperity: 2 });
      console.log('📊 Inventory set to 2 for both products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryFromSheets();
  }, []);

  // (Razorpay preload removed — using external redirect links now)

  // Single Razorpay payment page — amount / name / email / phone appended as query params
  const CHECKOUT_BASE_URL =
    "https://pages.razorpay.com/pl_TDoc8OeqSjFVvD/view";

  // Helper functions for inventory
  const getAvailableQuantity = (quantity: number) => {
    return quantity;
  };

  const isSoldOut = (quantity: number) => {
    return quantity <= 0;
  };
  const getMaxSelectableQuantity = (type: "rakhi1" | "rakhi2") => {
    // Display-only inventory of 50 per rakhi; cap total order at 10.
    const remaining = Math.max(0, 10 - totalQuantity);
    if (type === "rakhi1") return rakhi1Quantity + remaining;
    return rakhi2Quantity + remaining;
  };


  const validateForm = () => {
    if (grandTotalItems < 1) {
      setError("Please select at least 1 item to proceed.");
      return false;
    }
    if (totalQuantity > 10) {
      setError("Maximum 10 rakhis can be ordered in total.");
      return false;
    }
    setError("");
    return true;
  };

  const customerSchema = z.object({
    name: z
      .string()
      .trim()
      .nonempty({ message: "Please enter your name" })
      .max(100, { message: "Name must be under 100 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email" })
      .max(255),
    phone: z
      .string()
      .trim()
      .regex(/^\d{6,15}$/, {
        message: "Enter a valid mobile number",
      }),
    address1: z
      .string()
      .trim()
      .nonempty({ message: "Please enter Address Line 1" })
      .max(200),
    address2: z.string().trim().max(200).optional().or(z.literal("")),
    city: z
      .string()
      .trim()
      .nonempty({ message: "Please enter your city" })
      .max(80),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, { message: "Enter a valid 6-digit pincode" }),
  });

  const handleBuyNow = async () => {
    if (!validateForm()) return;

    const parsed = customerSchema.safeParse({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address1,
      address2,
      city,
      pincode,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your details");
      return;
    }

    const amount = totalAmount;
    if (!amount) {
      setError("Invalid amount. Please adjust quantity.");
      return;
    }

    const checkoutUrl = CHECKOUT_BASE_URL;

    setProcessing(true);
    setError("");
    try {
      const clientOrderId = clientOrderIdRef.current;

      // Fire webhook to Pabbly (fire-and-forget) as soon as user proceeds to payment
      void supabase.functions.invoke("notify-order-webhook", {
        body: {
          event: "checkout_initiated",
          client_order_id: clientOrderId,
          customer: {
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
          },
          address: {
            address1: parsed.data.address1,
            address2: parsed.data.address2 || "",
            city: parsed.data.city,
            pincode: parsed.data.pincode,
          },
          items: {
            chakra_qty: rakhi1Quantity,
            prosperity_qty: rakhi2Quantity,
            hooponopono_qty: testQuantity,
            total_qty: grandTotalItems,
          },
          amount,
          currency: "INR",
          checkout_url: checkoutUrl,
        },
      }).catch((e) => console.warn("[notify-order-webhook] failed:", e));

      // Record the order (status: pending) so the backend DB always has it
      void supabase.functions.invoke("record-order", {
        body: {
          client_order_id: clientOrderId,
          customer_name: parsed.data.name,
          customer_email: parsed.data.email,
          customer_phone: parsed.data.phone,
          address1: parsed.data.address1,
          address2: parsed.data.address2 || "",
          city: parsed.data.city,
          pincode: parsed.data.pincode,
          chakra_qty: rakhi1Quantity,
          prosperity_qty: rakhi2Quantity,
          hooponopono_qty: testQuantity,
          total_qty: grandTotalItems,
          amount,
          currency: "INR",
          status: "pending",
        },
      }).catch((e) => console.warn("[record-order] failed:", e));

      // Redirect to Razorpay payment page, prefilling name / email / phone / amount
      const redirectUrl = new URL(checkoutUrl);
      redirectUrl.searchParams.set("name", parsed.data.name);
      redirectUrl.searchParams.set("email", parsed.data.email);
      redirectUrl.searchParams.set("phone", parsed.data.phone);
      redirectUrl.searchParams.set("amount", String(amount));
      window.location.href = redirectUrl.toString();
    } catch (e) {
      console.error("[handleBuyNow] error", e);
      setError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const adjustQuantity = (type: "rakhi1" | "rakhi2", change: number) => {
    if (type === "rakhi1") {
      const maxQuantity = getMaxSelectableQuantity("rakhi1");
      const newQuantity = Math.max(0, Math.min(maxQuantity, rakhi1Quantity + change));
      setRakhi1Quantity(newQuantity);
    } else {
      const maxQuantity = getMaxSelectableQuantity("rakhi2");
      const newQuantity = Math.max(0, Math.min(maxQuantity, rakhi2Quantity + change));
      setRakhi2Quantity(newQuantity);
    }
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-background lg:px-10 lg:mx-[50px]">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-2 justify-center">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Raksha Bandhan Special</h1>
          <Gift className="h-6 w-6 text-secondary" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {currentSlide === 0 ? (
          /* Product Information View */
          <div className="p-4 min-h-[calc(100vh-80px)] flex flex-col">
            <div className="max-w-2xl mx-auto flex-1">
              {/* Product Title */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Special Divine Angelic Rakhis
                </h2>
                <p className="text-muted-foreground mb-4">By Angels On Earth</p>
              </div>

              {/* Image Carousel */}
              <div className="mb-6">
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {rakhiImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <img 
                          src={image} 
                          alt={`Rakhi ${index + 1}`}
                          className="w-full h-auto max-h-64 object-contain rounded-lg shadow-lg border-2 border-primary/20 bg-muted/20"
                          loading="lazy"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </div>

              {/* Rakhi Descriptions */}
              <div className="space-y-4 mb-6">
                <RakhiDescription
                  emoji="🌈"
                  title="7 Chakra's Rakhi"
                  short="Harmony, healing & divine protection."
                  more={
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Each color bead resonates with a specific chakra, helping your brother stay balanced, calm, and aligned on all levels—body, mind, and spirit.
                    </p>
                  }
                />
                <RakhiDescription
                  emoji="🌺"
                  title="Ho'oponopono Rakhi"
                  short="Forgiveness, love & inner peace."
                  more={
                    <>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Each crystal represents one of the five divine phrases, helping you release the past, heal the heart, and restore harmony within and in your relationships.
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        ✨ May this rakhi remind you that healing begins with you, and love transforms everything. 💗
                      </p>
                    </>
                  }
                />
                <RakhiDescription
                  emoji="💰"
                  title="Prosperity Rakhi"
                  short="A blessing of abundance & good fortune."
                  more={
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Designed to attract Lakshmi's blessings, this Rakhi carries the intention of a thriving, joy-filled future for your beloved brother.
                    </p>
                  }
                />
              </div>
            </div>
            
            {/* Order Here Button - Sticky at bottom */}
            <div className="mt-auto pt-4">
              <Button 
                onClick={() => setCurrentSlide(1)}
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Order Here <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Order Form View */
          <div className="p-4 min-h-[calc(100vh-80px)]">
            <Card className="shadow-xl border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="text-center text-foreground">Order Details</CardTitle>
                <CardDescription className="text-center">
                  Complete your purchase by providing your order details
                </CardDescription>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                
                {/* Customer & Address Details - shown in DETAILS step */}
                {checkoutStep === "details" && (
                <>
                <button
                  onClick={() => setCheckoutStep("items")}
                  className="text-sm text-primary underline underline-offset-2"
                >
                  ← Edit items
                </button>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Your Details</h4>
                  <Input id="name-m" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name" maxLength={100} />
                  <Input id="email-m" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" maxLength={255} />
                  <div className="flex gap-2">
                    <select
                      aria-label="Country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-2 text-sm shrink-0"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <Input id="phone-m" type="tel" inputMode="numeric" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))} placeholder="Mobile Number" maxLength={15} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Shipping Address</h4>
                  <Input id="addr1-m" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Address Line 1" maxLength={200} />
                  <Input id="addr2-m" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Address Line 2 (Optional)" maxLength={200} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="city-m" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" maxLength={80} />
                    <Input id="pin-m" inputMode="numeric" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="Pincode" maxLength={6} />
                  </div>
                </div>
                </>
                )}

                {/* Items - shown in ITEMS step */}
                {checkoutStep === "items" && (
                <>
                {/* Rakhi 1 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
                    <span className="text-xs text-green-600">{availability.chakra} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustQuantity("rakhi1", -1)}
                        disabled={rakhi1Quantity === 0}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </button>
                      <span className="w-8 text-center font-semibold">{rakhi1Quantity}</span>
                      <button 
                        onClick={() => adjustQuantity("rakhi1", 1)}
                        disabled={totalQuantity >= 10}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                  </div>
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Prosperity Rakhi</span>
                    <span className="text-xs text-green-600">{availability.prosperity} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustQuantity("rakhi2", -1)}
                        disabled={rakhi2Quantity === 0}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </button>
                      <span className="w-8 text-center font-semibold">{rakhi2Quantity}</span>
                      <button 
                        onClick={() => adjustQuantity("rakhi2", 1)}
                        disabled={totalQuantity >= 10}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                  </div>
                </div>

                {/* Ho'oponopono Rakhi */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Ho'oponopono Rakhi</span>
                    <span className="text-xs text-green-600">{availability.hooponopono} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTestQuantity(Math.max(0, testQuantity - 1))}
                      disabled={testQuantity === 0}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{testQuantity}</span>
                    <button
                      onClick={() => setTestQuantity(testQuantity + 1)}
                      disabled={totalQuantity >= 10}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>
                </>
                )}

                {/* Order Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Rakhis ({totalQuantity})</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Amount to be paid:</span>
                      <span className="text-primary">₹{totalAmount}</span>
                    </div>
                  </div>
                  {grandTotalItems > 0 && (
                    <div className="text-center mt-2 space-y-1">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        🚚 Shipping Charges Included
                      </span>
                      <div className="text-[10px] text-muted-foreground">(India Only)</div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Primary Action Button */}
                {checkoutStep === "items" ? (
                  <Button
                    onClick={() => {
                      if (!validateForm()) return;
                      setCheckoutStep("details");
                    }}
                    disabled={grandTotalItems < 1 || totalQuantity > 10}
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    Continue to details →
                  </Button>
                ) : (
                  <Button
                    onClick={handleBuyNow}
                    disabled={grandTotalItems < 1 || totalQuantity > 10 || processing}
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {processing ? "Processing..." : `Proceed to pay ₹${totalAmount}`}
                  </Button>
                )}

                {/* Secondary Back Button */}
                <Button
                  onClick={() => {
                    if (checkoutStep === "details") {
                      setCheckoutStep("items");
                    } else {
                      setCurrentSlide(0);
                    }
                  }}
                  variant="outline"
                  className="w-full h-10 text-sm font-medium"
                >
                  {checkoutStep === "details" ? "← Back to items" : "← Back to Product Details"}
                </Button>

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Maximum 10 Rakhis per order
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-[calc(100vh-80px)]">
        {/* Product Information - Left on desktop */}
        <div className="w-1/2 p-6 overflow-y-auto border-r">
          <div className="max-w-2xl">
            {/* Product Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Special Divine Angelic Rakhis
              </h2>
              <p className="text-muted-foreground mb-4">By Angels On Earth</p>
            </div>

            {/* Image Carousel */}
            <div className="mb-8">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {rakhiImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <img 
                        src={image} 
                        alt={`Rakhi ${index + 1}`}
                          className="w-full h-auto max-h-[420px] object-contain rounded-lg shadow-lg border-2 border-primary/20 bg-muted/20"
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>

            {/* Rakhi Descriptions */}
            <div className="space-y-6">
              <RakhiDescription
                size="md"
                emoji="🌈"
                title="7 Chakra's Rakhi"
                short="Harmony, healing & divine protection."
                more={
                  <p className="text-muted-foreground leading-relaxed">
                    Each color bead resonates with a specific chakra, helping your brother stay balanced, calm, and aligned on all levels—body, mind, and spirit. A sacred thread that radiates positivity and peace.
                  </p>
                }
              />
              <RakhiDescription
                size="md"
                emoji="🌺"
                title="Ho'oponopono Rakhi"
                short="Forgiveness, love & inner peace."
                more={
                  <>
                    <p className="text-muted-foreground leading-relaxed">
                      Each crystal represents one of the five divine phrases, helping you release the past, heal the heart, and restore harmony within and in your relationships.
                    </p>
                    <p className="text-muted-foreground leading-relaxed italic">
                      ✨ May this rakhi remind you that healing begins with you, and love transforms everything. 💗
                    </p>
                  </>
                }
              />
              <RakhiDescription
                size="md"
                emoji="💰"
                title="Prosperity Rakhi"
                short="A blessing of abundance & good fortune."
                more={
                  <p className="text-muted-foreground leading-relaxed">
                    Designed to attract Lakshmi's blessings, this Rakhi carries the intention of a thriving, joy-filled future for your beloved brother.
                  </p>
                }
              />
            </div>
          </div>
        </div>

        {/* Order Form - Right on desktop */}
        <div className="w-1/2 p-6 overflow-y-auto bg-card/50">
          <div className="sticky top-0">
            <Card className="shadow-xl border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="text-center text-foreground">Order Details</CardTitle>
                <CardDescription className="text-center">
                  Complete your purchase by providing your order details
                </CardDescription>
              </CardHeader>
               <CardContent className="p-6 space-y-6">
                
                {/* Customer & Address Details - DETAILS step */}
                {checkoutStep === "details" && (
                <>
                <button
                  onClick={() => setCheckoutStep("items")}
                  className="text-sm text-primary underline underline-offset-2 self-start"
                >
                  ← Edit items
                </button>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Your Details</h4>
                  <Input id="name-d" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name" maxLength={100} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="email-d" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" maxLength={255} />
                    <div className="flex gap-2">
                      <select
                        aria-label="Country code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-2 text-sm shrink-0"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <Input id="phone-d" type="tel" inputMode="numeric" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))} placeholder="Mobile Number" maxLength={15} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Shipping Address</h4>
                  <Input id="addr1-d" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Address Line 1" maxLength={200} />
                  <Input id="addr2-d" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Address Line 2 (Optional)" maxLength={200} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="city-d" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" maxLength={80} />
                    <Input id="pin-d" inputMode="numeric" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="Pincode" maxLength={6} />
                  </div>
                </div>
                </>
                )}

                {/* Items - ITEMS step */}
                {checkoutStep === "items" && (
                <>
                {/* Rakhi 1 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
                    <span className="text-xs text-green-600">{availability.chakra} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustQuantity("rakhi1", -1)}
                        disabled={rakhi1Quantity === 0}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </button>
                      <span className="w-8 text-center font-semibold">{rakhi1Quantity}</span>
                      <button 
                        onClick={() => adjustQuantity("rakhi1", 1)}
                        disabled={totalQuantity >= 10}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                  </div>
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Prosperity Rakhi</span>
                    <span className="text-xs text-green-600">{availability.prosperity} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustQuantity("rakhi2", -1)}
                        disabled={rakhi2Quantity === 0}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </button>
                      <span className="w-8 text-center font-semibold">{rakhi2Quantity}</span>
                      <button 
                        onClick={() => adjustQuantity("rakhi2", 1)}
                        disabled={totalQuantity >= 10}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                  </div>
                </div>

                {/* Ho'oponopono Rakhi */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Ho'oponopono Rakhi</span>
                    <span className="text-xs text-green-600">{availability.hooponopono} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTestQuantity(Math.max(0, testQuantity - 1))}
                      disabled={testQuantity === 0}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{testQuantity}</span>
                    <button
                      onClick={() => setTestQuantity(testQuantity + 1)}
                      disabled={totalQuantity >= 10}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>
                </>
                )}

                {/* Order Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Rakhis ({totalQuantity})</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Amount to be paid:</span>
                      <span className="text-primary">₹{totalAmount}</span>
                    </div>
                  </div>
                  {grandTotalItems > 0 && (
                    <div className="text-center mt-2 space-y-1">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        🚚 Shipping Charges Included
                      </span>
                      <div className="text-[10px] text-muted-foreground">(India Only)</div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Primary Action */}
                {checkoutStep === "items" ? (
                  <Button
                    onClick={() => {
                      if (!validateForm()) return;
                      setCheckoutStep("details");
                    }}
                    disabled={grandTotalItems < 1 || totalQuantity > 10}
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    Continue to details →
                  </Button>
                ) : (
                  <Button
                    onClick={handleBuyNow}
                    disabled={grandTotalItems < 1 || totalQuantity > 10 || processing}
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {processing ? "Processing..." : `Proceed to pay ₹${totalAmount}`}
                  </Button>
                )}

                {checkoutStep === "details" && (
                  <Button
                    onClick={() => setCheckoutStep("items")}
                    variant="outline"
                    className="w-full h-10 text-sm font-medium"
                  >
                    ← Back to items
                  </Button>
                )}

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Maximum 10 Rakhis per order
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Social proof floating toast */}
      <div
        aria-live="polite"
        className={`fixed bottom-20 left-4 lg:bottom-4 z-50 max-w-[85vw] sm:max-w-xs transition-all duration-500 ${
          socialProof.visible && socialProof.name
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs leading-tight">
            <p className="font-semibold text-foreground">
              {socialProof.name} from {socialProof.city}
            </p>
            <p className="text-muted-foreground">
              just bought {socialProof.qty} rakhi{socialProof.qty > 1 ? "s" : ""} 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
