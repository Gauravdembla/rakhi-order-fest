import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Heart, Gift, Plus, Minus, ArrowRight, RefreshCw } from "lucide-react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import {
  ensureRazorpayScript,
  createPaymentSessionWithConflictRecovery,
  openRazorpayCheckout,
} from "@/services/razorpayService";

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

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
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
    const prices = { 
      1: 199, 2: 299, 3: 399, 4: 499,
      5: 649, 6: 749, 7: 849, 8: 949,
      9: 1099, 10: 1199, 11: 1299, 12: 1349
    };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const grandTotalItems = totalQuantity + testQuantity;
  const totalAmount =
    (totalQuantity > 0 ? getPricing(totalQuantity) : 0) + testQuantity * 50;

  const rakhiImages = [
    "/lovable-uploads/2c76ff5a-d797-43bc-a6c8-379c00466d0f.png",
    "/lovable-uploads/caa9bb77-fa09-494b-b99b-9fc64bc2a3aa.png", 
    "/lovable-uploads/4988f179-e576-41e3-aa28-6a8d99ac9a29.png",
    "/lovable-uploads/f9ec6c91-83be-4589-835a-45de816fd0b7.png"
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

  // Preload Razorpay checkout script
  useEffect(() => {
    void ensureRazorpayScript();
  }, []);

  // Helper functions for inventory
  const getAvailableQuantity = (quantity: number) => {
    return quantity;
  };

  const isSoldOut = (quantity: number) => {
    return quantity <= 0;
  };
  const getMaxSelectableQuantity = (type: "rakhi1" | "rakhi2") => {
    if (type === "rakhi1") {
      return isSoldOut(inventory.chakra) ? 0 : Math.min(12, getAvailableQuantity(inventory.chakra));
    } else {
      return isSoldOut(inventory.prosperity) ? 0 : Math.min(12, getAvailableQuantity(inventory.prosperity));
    }
  };


  const validateForm = () => {
    if (grandTotalItems < 1) {
      setError("Please select at least 1 item to proceed.");
      return false;
    }
    if (totalQuantity > 12) {
      setError("Maximum 12 rakhis can be ordered in total.");
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

    setProcessing(true);
    setError("");
    try {
      await ensureRazorpayScript();
      const clientOrderId = `rakhi_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}_C${rakhi1Quantity}_P${rakhi2Quantity}_T${testQuantity}`;

      const config = {
        amount,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: `${countryCode}${parsed.data.phone}`,
        clientOrderId,
        address1: parsed.data.address1,
        address2: parsed.data.address2 || "",
        city: parsed.data.city,
        pincode: parsed.data.pincode,
      };

      const { session, effectiveConfig } =
        await createPaymentSessionWithConflictRecovery(config);
      if (!session.ok) {
        const conflict =
          session.status === 409 || /conflict/i.test(session.body || "");
        setError(
          conflict
            ? "We found an existing account with different contact details. Please use the email or phone you originally registered with."
            : session.err || "Could not start payment. Please try again.",
        );
        setProcessing(false);
        return;
      }

      openRazorpayCheckout(
        session,
        effectiveConfig,
        (response) => {
          setProcessing(false);
          toast({
            title: "Payment successful 🎉",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          setRakhi1Quantity(0);
          setRakhi2Quantity(0);
          setTestQuantity(0);
          setCustomerName("");
          setCustomerEmail("");
          setCustomerPhone("");
          setAddress1("");
          setAddress2("");
          setCity("");
          setPincode("");
          setCheckoutStep("items");
        },
        (err) => {
          setProcessing(false);
          setError(err?.description || "Payment failed. Please try again.");
        },
        () => {
          setProcessing(false);
        }
      );
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
                <Carousel className="w-full">
                  <CarouselContent>
                    {rakhiImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <img 
                          src={image} 
                          alt={`Rakhi ${index + 1}`}
                          className="w-full h-48 md:h-64 object-cover rounded-lg shadow-lg border-2 border-primary/20"
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
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">🌈 7 Chakra's Rakhi</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Infused with the energy of the seven chakras, this vibrant Rakhi is a symbol of harmony, healing, and divine protection. Each color bead resonates with a specific chakra, helping your brother stay balanced, calm, and aligned on all levels—body, mind, and spirit.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">💰 Prosperity Rakhi</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Blessed with the energies of abundance and good fortune, the Prosperity Rakhi is more than a thread—it's a divine wish for success, wealth, and well-being. Designed to attract Lakshmi's blessings, this Rakhi carries the intention of a thriving, joy-filled future for your beloved brother.
                  </p>
                </div>
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
                
                {/* Customer & Address Details */}
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

                {/* Rakhi 1 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
                    {loading ? (
                      <span className="text-xs text-yellow-600">Loading...</span>
                    ) : isSoldOut(inventory.chakra) ? (
                      <span className="text-xs text-red-500 font-medium">SOLD OUT</span>
                    ) : (
                      <span className="text-xs text-green-600">
                        {getAvailableQuantity(inventory.chakra)} Available
                      </span>
                    )}
                  </div>
                  {loading ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-medium">
                      Loading...
                    </div>
                  ) : isSoldOut(inventory.chakra) ? (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
                      SOLD OUT
                    </div>
                  ) : (
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
                        disabled={rakhi1Quantity >= getMaxSelectableQuantity("rakhi1") || totalQuantity === 12}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Prosperity Rakhi</span>
                    {loading ? (
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    ) : isSoldOut(inventory.prosperity) ? (
                      <span className="text-xs text-red-500 font-medium">SOLD OUT</span>
                    ) : (
                      <span className="text-xs text-green-600">
                        {getAvailableQuantity(inventory.prosperity)} Available
                      </span>
                    )}
                  </div>
                  {loading ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-medium">
                      Loading...
                    </div>
                  ) : isSoldOut(inventory.prosperity) ? (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
                      SOLD OUT
                    </div>
                  ) : (
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
                        disabled={rakhi2Quantity >= getMaxSelectableQuantity("rakhi2") || totalQuantity === 12}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Test Rakhi */}
                <div className="flex items-center justify-between p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">🧪 Test Rakhi</span>
                    <span className="text-xs text-muted-foreground">₹50 (for payment testing)</span>
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
                      onClick={() => setTestQuantity(Math.min(5, testQuantity + 1))}
                      disabled={testQuantity >= 5}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Rakhis ({totalQuantity})</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                  </div>
                  {testQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Test Rakhi ({testQuantity})</span>
                      <span>₹{testQuantity * 50}</span>
                    </div>
                  )}
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

                {/* Buy Button */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={grandTotalItems < 1 || totalQuantity > 12 || processing}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {processing ? "Processing..." : `Proceed to pay ₹${totalAmount}`}
                </Button>

                {/* Back Button */}
                <Button 
                  onClick={() => setCurrentSlide(0)}
                  variant="outline"
                  className="w-full h-10 text-sm font-medium"
                >
                  ← Back to Product Details
                </Button>

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Maximum 12 Rakhis per order
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
              <Carousel className="w-full">
                <CarouselContent>
                  {rakhiImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <img 
                        src={image} 
                        alt={`Rakhi ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg shadow-lg border-2 border-primary/20"
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
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">🌈 7 Chakra's Rakhi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Infused with the energy of the seven chakras, this vibrant Rakhi is a symbol of harmony, healing, and divine protection. Each color bead resonates with a specific chakra, helping your brother stay balanced, calm, and aligned on all levels—body, mind, and spirit. A sacred thread that radiates positivity and peace.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">💰 Prosperity Rakhi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Blessed with the energies of abundance and good fortune, the Prosperity Rakhi is more than a thread—it's a divine wish for success, wealth, and well-being. Designed to attract Lakshmi's blessings, this Rakhi carries the intention of a thriving, joy-filled future for your beloved brother.
                </p>
              </div>
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
                
                {/* Customer & Address Details */}
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

                {/* Rakhi 1 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
                    {loading ? (
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    ) : isSoldOut(inventory.chakra) ? (
                      <span className="text-xs text-red-500 font-medium">SOLD OUT</span>
                    ) : (
                      <span className="text-xs text-green-600">
                        {getAvailableQuantity(inventory.chakra)} Available
                      </span>
                    )}
                  </div>
                  {loading ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-medium">
                      Loading...
                    </div>
                  ) : isSoldOut(inventory.chakra) ? (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
                      SOLD OUT
                    </div>
                  ) : (
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
                        disabled={rakhi1Quantity >= getMaxSelectableQuantity("rakhi1") || totalQuantity === 12}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Prosperity Rakhi</span>
                    {loading ? (
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    ) : isSoldOut(inventory.prosperity) ? (
                      <span className="text-xs text-red-500 font-medium">SOLD OUT</span>
                    ) : (
                      <span className="text-xs text-green-600">
                        {getAvailableQuantity(inventory.prosperity)} Available
                      </span>
                    )}
                  </div>
                  {loading ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-medium">
                      Loading...
                    </div>
                  ) : isSoldOut(inventory.prosperity) ? (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
                      SOLD OUT
                    </div>
                  ) : (
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
                        disabled={rakhi2Quantity >= getMaxSelectableQuantity("rakhi2") || totalQuantity === 12}
                        className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Test Rakhi */}
                <div className="flex items-center justify-between p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">🧪 Test Rakhi</span>
                    <span className="text-xs text-muted-foreground">₹50 (for payment testing)</span>
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
                      onClick={() => setTestQuantity(Math.min(5, testQuantity + 1))}
                      disabled={testQuantity >= 5}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Rakhis ({totalQuantity})</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                  </div>
                  {testQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Test Rakhi ({testQuantity})</span>
                      <span>₹{testQuantity * 50}</span>
                    </div>
                  )}
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

                {/* Buy Button */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={grandTotalItems < 1 || totalQuantity > 12 || processing}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {processing ? "Processing..." : `Proceed to pay ₹${totalAmount}`}
                </Button>

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Maximum 12 Rakhis per order
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
