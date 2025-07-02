import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Gift, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

const Index = () => {
  const [rakhi1Quantity, setRakhi1Quantity] = useState<number>(0);
  const [rakhi2Quantity, setRakhi2Quantity] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
  
  const getPricing = (quantity: number) => {
    const prices = { 1: 199, 2: 299, 3: 399, 4: 499 };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const rakhiImages = [
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1280&h=720&fit=crop",
    "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1280&h=720&fit=crop", 
    "https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=1280&h=720&fit=crop",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1280&h=720&fit=crop&brightness=0.8",
    "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1280&h=720&fit=crop&brightness=1.2"
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % rakhiImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + rakhiImages.length) % rakhiImages.length);
  };


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
      const urls = {
        1: "https://example.com/1rakhi",
        2: "https://example.com/2rakhis", 
        3: "https://example.com/3rakhis",
        4: "https://example.com/4rakhis"
      };
      window.location.href = urls[totalQuantity as keyof typeof urls];
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

      {/* Main Content - 50:50 Split */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Left Side - Product Information (50%) */}
        <div className="w-1/2 p-6 overflow-y-auto border-r">
          <div className="max-w-2xl">
            {/* Product Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Special Divine Angelic Rakhis
              </h2>
              <p className="text-muted-foreground mb-4">By Divine Creations</p>
            </div>

            {/* Image Navigation */}
            <div className="mb-8">
              <div className="relative">
                <img 
                  src={rakhiImages[currentImageIndex]} 
                  alt={`Divine Angelic Rakhi ${currentImageIndex + 1}`}
                  className="w-full h-80 object-cover rounded-lg shadow-lg border-2 border-primary/20"
                />
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6 text-primary" />
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-6 w-6 text-primary" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {rakhiImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Simple Description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">🕉️ Angels on Earth Rakhi Collection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with the Divine. Receive. Heal. Transform. Experience divine protection and blessings with our handcrafted Special Divine Angelic Rakhis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form (50%) */}
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
                  <span className="font-medium text-foreground">Divine Angelic Rakhi 1</span>
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
                  <span className="font-medium text-foreground">Divine Angelic Rakhi 2</span>
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
                    <span>Divine Angelic Rakhis ({totalQuantity})</span>
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
