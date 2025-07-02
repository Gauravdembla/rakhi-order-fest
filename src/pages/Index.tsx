import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Heart, Gift, Plus, Minus } from "lucide-react";
import chakraRakhi from "@/assets/chakra-rakhi-optimized.jpg";
import prosperityRakhi from "@/assets/prosperity-rakhi-optimized.jpg";

const Index = () => {
  const [rakhi1Quantity, setRakhi1Quantity] = useState<number>(0);
  const [rakhi2Quantity, setRakhi2Quantity] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
  
  const getPricing = (quantity: number) => {
    const prices = { 1: 199, 2: 299, 3: 399, 4: 499 };
    return prices[quantity as keyof typeof prices] || 0;
  };

  // Optimized smaller images for faster loading
  const rakhiImages = [
    chakraRakhi,
    prosperityRakhi
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-2 justify-center">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Raksha Bandhan Special</h1>
          <Gift className="h-6 w-6 text-secondary" />
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* Left Side - Product Information */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto lg:border-r">
          <div className="max-w-2xl mx-auto lg:mx-0">
            {/* Product Title */}
            <div className="mb-4 lg:mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Special Divine Angelic Rakhis
              </h2>
              <p className="text-muted-foreground mb-4">By Angels On Earth</p>
            </div>

            {/* Image Carousel */}
            <div className="mb-6 lg:mb-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {rakhiImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <img 
                        src={image} 
                        alt={`Rakhi ${index + 1}`}
                        className="w-full h-48 lg:h-64 object-cover rounded-lg shadow-lg border-2 border-primary/20"
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 lg:left-4" />
                <CarouselNext className="right-2 lg:right-4" />
              </Carousel>
            </div>

            {/* Rakhi Descriptions */}
            <div className="space-y-4 lg:space-y-6">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">🌈 7 Chakra's Rakhi</h3>
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                  Infused with the energy of the seven chakras, this vibrant Rakhi is a symbol of harmony, healing, and divine protection. Each color bead resonates with a specific chakra, helping your brother stay balanced, calm, and aligned on all levels—body, mind, and spirit. A sacred thread that radiates positivity and peace.
                </p>
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">💰 Prosperity Rakhi</h3>
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                  Blessed with the energies of abundance and good fortune, the Prosperity Rakhi is more than a thread—it's a divine wish for success, wealth, and well-being. Designed to attract Lakshmi's blessings, this Rakhi carries the intention of a thriving, joy-filled future for your beloved brother.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto bg-card/50">
          <div className="sticky top-0">
            <Card className="shadow-xl border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="text-center text-foreground">Order Details</CardTitle>
                <CardDescription className="text-center">
                  Complete your purchase by providing your order details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                
                {/* Rakhi 1 */}
                <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg">
                  <span className="font-medium text-foreground text-sm lg:text-base">7 Chakra's Rakhi</span>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi1", -1)}
                      disabled={rakhi1Quantity === 0}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    </button>
                    <span className="w-6 lg:w-8 text-center font-semibold text-sm lg:text-base">{rakhi1Quantity}</span>
                    <button
                      onClick={() => adjustQuantity("rakhi1", 1)}
                      disabled={rakhi1Quantity === 4 || totalQuantity === 4}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Rakhi 2 */}
                <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg">
                  <span className="font-medium text-foreground text-sm lg:text-base">Prosperity Rakhi</span>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button 
                      onClick={() => adjustQuantity("rakhi2", -1)}
                      disabled={rakhi2Quantity === 0}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    </button>
                    <span className="w-6 lg:w-8 text-center font-semibold text-sm lg:text-base">{rakhi2Quantity}</span>
                    <button 
                      onClick={() => adjustQuantity("rakhi2", 1)}
                      disabled={rakhi2Quantity === 4 || totalQuantity === 4}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-primary flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 p-3 lg:p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground text-sm lg:text-base">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Rakhis ({totalQuantity})</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) : 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-sm lg:text-base">
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
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Buy Button */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={totalQuantity < 1 || totalQuantity > 4}
                  className="w-full h-10 lg:h-12 text-base lg:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
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
