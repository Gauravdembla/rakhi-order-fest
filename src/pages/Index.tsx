import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Heart, Gift, Plus, Minus, ArrowRight } from "lucide-react";

const Index = () => {
  const [rakhi1Quantity, setRakhi1Quantity] = useState<number>(0);
  const [rakhi2Quantity, setRakhi2Quantity] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [inventory, setInventory] = useState({ chakra: 0, prosperity: 0 });
  const [loading, setLoading] = useState(true);

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
  
  const getPricing = (quantity: number) => {
    const prices = { 
      1: 199, 2: 299, 3: 399, 4: 499,
      5: 649, 6: 749, 7: 849, 8: 949,
      9: 1099, 10: 1199, 11: 1299, 12: 1349
    };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const rakhiImages = [
    "/lovable-uploads/2c76ff5a-d797-43bc-a6c8-379c00466d0f.png",
    "/lovable-uploads/caa9bb77-fa09-494b-b99b-9fc64bc2a3aa.png", 
    "/lovable-uploads/4988f179-e576-41e3-aa28-6a8d99ac9a29.png",
    "/lovable-uploads/f9ec6c91-83be-4589-835a-45de816fd0b7.png"
  ];

  // Google Sheets integration
  const fetchInventoryFromSheets = async () => {
    try {
      const sheetId = "1zcVxd3iwlwDGoHtDo4pyLUXIkLu5jIcaLtj12xSKEuE";
      const range = "Sheet1!B2:C2";
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&range=${range}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      // Parse CSV response
      const lines = text.split('\n');
      if (lines.length > 0) {
        const values = lines[0].split(',').map(val => val.replace(/"/g, ''));
        const chakraQty = parseInt(values[0]) || 0;
        const prosperityQty = parseInt(values[1]) || 0;
        
        setInventory({ chakra: chakraQty, prosperity: prosperityQty });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Fallback to default values
      setInventory({ chakra: 9, prosperity: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryFromSheets();
  }, []);

  // Helper functions for inventory
  const getAvailableQuantity = (quantity: number) => {
    return quantity >= 5 ? quantity - 5 : 0;
  };

  const isSoldOut = (quantity: number) => {
    return quantity < 5;
  };

  const getMaxSelectableQuantity = (type: "rakhi1" | "rakhi2") => {
    if (type === "rakhi1") {
      return isSoldOut(inventory.chakra) ? 0 : Math.min(12, inventory.chakra);
    } else {
      return isSoldOut(inventory.prosperity) ? 0 : Math.min(12, inventory.prosperity);
    }
  };


  const validateForm = () => {
    if (totalQuantity < 1) {
      setError("Please select at least 1 rakhi to proceed.");
      return false;
    }
    if (totalQuantity > 12) {
      setError("Maximum 12 rakhis can be ordered in total.");
      return false;
    }
    setError("");
    return true;
  };

  const handleBuyNow = () => {
    if (validateForm()) {
      // Redirection mapping based on exact combinations
      const redirectionMap: { [key: string]: string } = {
        "1-0": "https://shree.vip/chakra-rakhi-1",
        "0-1": "https://shree.vip/prosperity-rakhi-1",
        "2-0": "https://shree.vip/chakra-rakhi-2",
        "1-1": "https://shree.vip/chakra1-prosperity1",
        "0-2": "https://shree.vip/prosperity-rakhi-2",
        "3-0": "https://shree.vip/chakra-rakhi-3",
        "2-1": "https://shree.vip/chakra2-prosperity1",
        "1-2": "https://shree.vip/chakra1-prosperity2",
        "0-3": "https://shree.vip/prosperity-rakhi-3",
        "4-0": "https://shree.vip/chakra-rakhi-4",
        "3-1": "https://shree.vip/chakra3-prosperity1",
        "2-2": "https://shree.vip/chakra2-prosperity2",
        "1-3": "https://shree.vip/chakra1-prosperity3",
        "0-4": "https://shree.vip/prosperity-rakhi-4",
        "0-5": "https://shree.vip/rakhi-set-5-c0-p5",
        "1-4": "https://shree.vip/rakhi-set-5-c1-p4",
        "2-3": "https://shree.vip/rakhi-set-5-c2-p3",
        "3-2": "https://shree.vip/rakhi-set-5-c3-p2",
        "4-1": "https://shree.vip/rakhi-set-5-c4-p1",
        "5-0": "https://shree.vip/rakhi-set-5-c5-p0",
        "0-6": "https://shree.vip/rakhi-set-6-c0-p6",
        "1-5": "https://shree.vip/rakhi-set-6-c1-p5",
        "2-4": "https://shree.vip/rakhi-set-6-c2-p4",
        "3-3": "https://shree.vip/rakhi-set-6-c3-p3",
        "4-2": "https://shree.vip/rakhi-set-6-c4-p2",
        "5-1": "https://shree.vip/rakhi-set-6-c5-p1",
        "6-0": "https://shree.vip/rakhi-set-6-c6-p0",
        "0-7": "https://shree.vip/rakhi-set-7-c0-p7",
        "1-6": "https://shree.vip/rakhi-set-7-c1-p6",
        "2-5": "https://shree.vip/rakhi-set-7-c2-p5",
        "3-4": "https://shree.vip/rakhi-set-7-c3-p4",
        "4-3": "https://shree.vip/rakhi-set-7-c4-p3",
        "5-2": "https://shree.vip/rakhi-set-7-c5-p2",
        "6-1": "https://shree.vip/rakhi-set-7-c6-p1",
        "7-0": "https://shree.vip/rakhi-set-7-c7-p0",
        "0-8": "https://shree.vip/rakhi-set-8-c0-p8",
        "1-7": "https://shree.vip/rakhi-set-8-c1-p7",
        "2-6": "https://shree.vip/rakhi-set-8-c2-p6",
        "3-5": "https://shree.vip/rakhi-set-8-c3-p5",
        "4-4": "https://shree.vip/rakhi-set-8-c4-p4",
        "5-3": "https://shree.vip/rakhi-set-8-c5-p3",
        "6-2": "https://shree.vip/rakhi-set-8-c6-p2",
        "7-1": "https://shree.vip/rakhi-set-8-c7-p1",
        "8-0": "https://shree.vip/rakhi-set-8-c8-p0",
        "0-9": "https://shree.vip/rakhi-set-9-c0-p9",
        "1-8": "https://shree.vip/rakhi-set-9-c1-p8",
        "2-7": "https://shree.vip/rakhi-set-9-c2-p7",
        "3-6": "https://shree.vip/rakhi-set-9-c3-p6",
        "4-5": "https://shree.vip/rakhi-set-9-c4-p5",
        "5-4": "https://shree.vip/rakhi-set-9-c5-p4",
        "6-3": "https://shree.vip/rakhi-set-9-c6-p3",
        "7-2": "https://shree.vip/rakhi-set-9-c7-p2",
        "8-1": "https://shree.vip/rakhi-set-9-c8-p1",
        "9-0": "https://shree.vip/rakhi-set-9-c9-p0",
        "0-10": "https://shree.vip/rakhi-set-10-c0-p10",
        "1-9": "https://shree.vip/rakhi-set-10-c1-p9",
        "2-8": "https://shree.vip/rakhi-set-10-c2-p8",
        "3-7": "https://shree.vip/rakhi-set-10-c3-p7",
        "4-6": "https://shree.vip/rakhi-set-10-c4-p6",
        "5-5": "https://shree.vip/rakhi-set-10-c5-p5",
        "6-4": "https://shree.vip/rakhi-set-10-c6-p4",
        "7-3": "https://shree.vip/rakhi-set-10-c7-p3",
        "8-2": "https://shree.vip/rakhi-set-10-c8-p2",
        "9-1": "https://shree.vip/rakhi-set-10-c9-p1",
        "10-0": "https://shree.vip/rakhi-set-10-c10-p0",
        "0-11": "https://shree.vip/rakhi-set-11-c0-p11",
        "1-10": "https://shree.vip/rakhi-set-11-c1-p10",
        "2-9": "https://shree.vip/rakhi-set-11-c2-p9",
        "3-8": "https://shree.vip/rakhi-set-11-c3-p8",
        "4-7": "https://shree.vip/rakhi-set-11-c4-p7",
        "5-6": "https://shree.vip/rakhi-set-11-c5-p6",
        "6-5": "https://shree.vip/rakhi-set-11-c6-p5",
        "7-4": "https://shree.vip/rakhi-set-11-c7-p4",
        "8-3": "https://shree.vip/rakhi-set-11-c8-p3",
        "9-2": "https://shree.vip/rakhi-set-11-c9-p2",
        "10-1": "https://shree.vip/rakhi-set-11-c10-p1",
        "11-0": "https://shree.vip/rakhi-set-11-c11-p0",
        "0-12": "https://shree.vip/rakhi-set-12-c0-p12",
        "1-11": "https://shree.vip/rakhi-set-12-c1-p11",
        "2-10": "https://shree.vip/rakhi-set-12-c2-p10",
        "3-9": "https://shree.vip/rakhi-set-12-c3-p9",
        "4-8": "https://shree.vip/rakhi-set-12-c4-p8",
        "5-7": "https://shree.vip/rakhi-set-12-c5-p7",
        "6-6": "https://shree.vip/rakhi-set-12-c6-p6",
        "7-5": "https://shree.vip/rakhi-set-12-c7-p5",
        "8-4": "https://shree.vip/rakhi-set-12-c8-p4",
        "9-3": "https://shree.vip/rakhi-set-12-c9-p3",
        "10-2": "https://shree.vip/rakhi-set-12-c10-p2",
        "11-1": "https://shree.vip/rakhi-set-12-c11-p1",
        "12-0": "https://shree.vip/rakhi-set-12-c12-p0"
      };
      
      const combinationKey = `${rakhi1Quantity}-${rakhi2Quantity}`;
      const redirectUrl = redirectionMap[combinationKey];
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi1", -1)}
                      disabled={rakhi1Quantity === 0 || isSoldOut(inventory.chakra)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{rakhi1Quantity}</span>
                    <button 
                      onClick={() => adjustQuantity("rakhi1", 1)}
                      disabled={isSoldOut(inventory.chakra) || rakhi1Quantity >= getMaxSelectableQuantity("rakhi1") || totalQuantity === 12}
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi2", -1)}
                      disabled={rakhi2Quantity === 0 || isSoldOut(inventory.prosperity)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{rakhi2Quantity}</span>
                    <button 
                      onClick={() => adjustQuantity("rakhi2", 1)}
                      disabled={isSoldOut(inventory.prosperity) || rakhi2Quantity >= getMaxSelectableQuantity("rakhi2") || totalQuantity === 12}
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
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Amount to be paid:</span>
                      <span className="text-primary">₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                    </div>
                  </div>
                  {totalQuantity > 0 && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        🚚 Shipping Charges Included
                      </span>
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
                  disabled={totalQuantity < 1 || totalQuantity > 12}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  Proceed to pay ₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi1", -1)}
                      disabled={rakhi1Quantity === 0 || isSoldOut(inventory.chakra)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{rakhi1Quantity}</span>
                    <button 
                      onClick={() => adjustQuantity("rakhi1", 1)}
                      disabled={isSoldOut(inventory.chakra) || rakhi1Quantity >= getMaxSelectableQuantity("rakhi1") || totalQuantity === 12}
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi2", -1)}
                      disabled={rakhi2Quantity === 0 || isSoldOut(inventory.prosperity)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4 text-primary" />
                    </button>
                    <span className="w-8 text-center font-semibold">{rakhi2Quantity}</span>
                    <button 
                      onClick={() => adjustQuantity("rakhi2", 1)}
                      disabled={isSoldOut(inventory.prosperity) || rakhi2Quantity >= getMaxSelectableQuantity("rakhi2") || totalQuantity === 12}
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
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Amount to be paid:</span>
                      <span className="text-primary">₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                    </div>
                  </div>
                  {totalQuantity > 0 && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        🚚 Shipping Charges Included
                      </span>
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
                  disabled={totalQuantity < 1 || totalQuantity > 12}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  Proceed to pay ₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}
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
