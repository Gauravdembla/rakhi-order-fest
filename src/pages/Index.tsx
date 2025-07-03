import { useState } from "react";
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

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
  
  const getPricing = (quantity: number) => {
    const prices = { 1: 199, 2: 299, 3: 399, 4: 499 };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const rakhiImages = [
    "/lovable-uploads/2c76ff5a-d797-43bc-a6c8-379c00466d0f.png",
    "/lovable-uploads/caa9bb77-fa09-494b-b99b-9fc64bc2a3aa.png", 
    "/lovable-uploads/4988f179-e576-41e3-aa28-6a8d99ac9a29.png",
    "/lovable-uploads/f9ec6c91-83be-4589-835a-45de816fd0b7.png"
  ];


  const validateForm = () => {
    if (totalQuantity < 1) {
      setError("Please select at least 1 rakhi to proceed.");
      return false;
    }
    if (totalQuantity > 4) {
      setError("Maximum 4 rakhis can be ordered in total.");
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
        "0-4": "https://shree.vip/prosperity-rakhi-4"
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
      const newQuantity = Math.max(0, Math.min(4, rakhi1Quantity + change));
      setRakhi1Quantity(newQuantity);
    } else {
      const newQuantity = Math.max(0, Math.min(4, rakhi2Quantity + change));
      setRakhi2Quantity(newQuantity);
    }
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-background lg:px-10">
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
                  <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
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
                      disabled={rakhi1Quantity === 4 || totalQuantity === 4}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium text-foreground">Prosperity Rakhi</span>
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
                      disabled={rakhi2Quantity === 4 || totalQuantity === 4}
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
                  disabled={totalQuantity < 1 || totalQuantity > 4}
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
                    Maximum 4 Rakhis per order
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
                  <span className="font-medium text-foreground">7 Chakra's Rakhi</span>
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
                      disabled={rakhi1Quantity === 4 || totalQuantity === 4}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium text-foreground">Prosperity Rakhi</span>
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
                      disabled={rakhi2Quantity === 4 || totalQuantity === 4}
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
                  disabled={totalQuantity < 1 || totalQuantity > 4}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  Proceed to pay ₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}
                </Button>

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Maximum 4 Rakhis per order
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
