import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Gift } from "lucide-react";

const Index = () => {
  const [rakhi1Quantity, setRakhi1Quantity] = useState<number>(0);
  const [rakhi2Quantity, setRakhi2Quantity] = useState<number>(0);
  const [rakhi1Color, setRakhi1Color] = useState<string>("");
  const [rakhi1Flavor, setRakhi1Flavor] = useState<string>("");
  const [rakhi2Color, setRakhi2Color] = useState<string>("");
  const [rakhi2Flavor, setRakhi2Flavor] = useState<string>("");
  const [error, setError] = useState<string>("");

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;
  
  const getPricing = (quantity: number) => {
    const prices = { 1: 199, 2: 299, 3: 399, 4: 499 };
    return prices[quantity as keyof typeof prices] || 0;
  };

  const colors = ["Red & Gold", "Pink & Silver", "Blue & Gold", "Orange & Silver", "Purple & Gold"];
  const flavors = ["Rose", "Sandalwood", "Jasmine", "Lavender", "Vanilla"];

  const rakhiImages = [
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop", 
    "https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop"
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
    if (rakhi1Quantity > 0 && (!rakhi1Color || !rakhi1Flavor)) {
      setError("Please select color and flavor for Rakhi 1.");
      return false;
    }
    if (rakhi2Quantity > 0 && (!rakhi2Color || !rakhi2Flavor)) {
      setError("Please select color and flavor for Rakhi 2.");
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

  const handleQuantityChange = (type: "rakhi1" | "rakhi2", value: string) => {
    const quantity = parseInt(value);
    if (type === "rakhi1") {
      setRakhi1Quantity(quantity);
      if (quantity === 0) {
        setRakhi1Color("");
        setRakhi1Flavor("");
      }
    } else {
      setRakhi2Quantity(quantity);
      if (quantity === 0) {
        setRakhi2Color("");
        setRakhi2Flavor("");
      }
    }
    // Clear error when user makes changes
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

      {/* Main Content - Fixed Side by Side */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Left Side - Product Information and Images */}
        <div className="flex-1 p-6 overflow-y-auto border-r">
          <div className="max-w-2xl">
            {/* Product Title and Price */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Special Divine Angelic Rakhis
              </h2>
              <p className="text-muted-foreground mb-4">By Divine Creations</p>
              <div className="text-4xl font-bold text-primary mb-2">
                ₹199 - ₹499
              </div>
              <p className="text-sm text-muted-foreground">(Inclusive of all taxes)</p>
            </div>

            {/* Image Scroller */}
            <div className="mb-8">
              <div className="relative">
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4">
                    {rakhiImages.map((image, index) => (
                      <div key={index} className="flex-shrink-0">
                        <img 
                          src={image} 
                          alt={`Divine Angelic Rakhi ${index + 1}`}
                          className="w-80 h-60 object-cover rounded-lg shadow-lg border-2 border-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">🕉️ Angels on Earth Rakhi Collection</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Connect with the Divine. Receive. Heal. Transform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Step into a sacred journey of light, love, and guidance with the Angels on Earth Special Divine Angelic Rakhis. 
                  This magical collection is a powerful portal to help you connect with angels, archangels, gods and goddesses, 
                  ascended masters, spirit animals, and elemental beings who walk with you on Earth to guide, heal, and uplift you.
                </p>
              </div>

              <div>
                <p className="text-muted-foreground leading-relaxed">
                  Each rakhi has been divinely channeled and vibrationally crafted to offer you clear, loving guidance for any area of 
                  your life—be it relationships, health, purpose, or prosperity. Whether you're a beginner or a seasoned seeker, these 
                  rakhis will open the doorway to higher wisdom, healing energies, and spiritual transformation.
                </p>
              </div>

              {/* What's Inside */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3">✨ What's Inside:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Premium quality rakhis with stunning divine artwork</li>
                  <li>• Beautifully crafted designs with sacred symbols</li>
                  <li>• Multiple color combinations: Red & Gold, Pink & Silver, Blue & Gold, Orange & Silver, Purple & Gold</li>
                  <li>• Sacred fragrances: Rose, Sandalwood, Jasmine, Lavender, Vanilla</li>
                  <li>• Easy-to-follow instructions for spiritual connection</li>
                </ul>
              </div>

              {/* Why You'll Love It */}
              <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                <h4 className="font-semibold text-foreground mb-3">🌟 Why You'll Love It:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Receive messages from your spirit team, anytime</li>
                  <li>• Get clarity and direction during life's turning points</li>
                  <li>• Activate your intuitive powers and inner knowing</li>
                  <li>• Elevate your vibration and align with your divine path</li>
                  <li>• Experience divine protection and blessings</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="text-muted-foreground italic">
                  "If you've been asking for signs, guidance, or miracles... this rakhi collection is your answer. 
                  Let your angels speak. Let your soul remember. This is more than a rakhi—it's a divine experience."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Form */}
        <div className="w-96 p-6 overflow-y-auto bg-card/50">
          <div className="sticky top-0">
            <Card className="shadow-xl border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="text-center text-foreground">Order Details</CardTitle>
                <CardDescription className="text-center">
                  Complete your purchase by providing your order details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Rakhi 1 Selection */}
                <div className="space-y-4">
                  <Label className="text-foreground font-medium text-base">
                    Divine Angelic Rakhi 1
                  </Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="rakhi1-qty" className="text-sm text-muted-foreground">Quantity</Label>
                      <Select value={rakhi1Quantity.toString()} onValueChange={(value) => handleQuantityChange("rakhi1", value)}>
                        <SelectTrigger id="rakhi1-qty" className="border-2 focus:border-primary">
                          <SelectValue placeholder="Choose quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num === 0 ? "None" : `${num} Rakhi${num > 1 ? "s" : ""}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {rakhi1Quantity > 0 && (
                      <>
                        <div>
                          <Label htmlFor="rakhi1-color" className="text-sm text-muted-foreground">Color</Label>
                          <Select value={rakhi1Color} onValueChange={setRakhi1Color}>
                            <SelectTrigger id="rakhi1-color" className="border-2 focus:border-primary">
                              <SelectValue placeholder="Choose color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="rakhi1-flavor" className="text-sm text-muted-foreground">Flavor</Label>
                          <Select value={rakhi1Flavor} onValueChange={setRakhi1Flavor}>
                            <SelectTrigger id="rakhi1-flavor" className="border-2 focus:border-primary">
                              <SelectValue placeholder="Choose flavor" />
                            </SelectTrigger>
                            <SelectContent>
                              {flavors.map((flavor) => (
                                <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rakhi 2 Selection */}
                <div className="space-y-4">
                  <Label className="text-foreground font-medium text-base">
                    Divine Angelic Rakhi 2
                  </Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="rakhi2-qty" className="text-sm text-muted-foreground">Quantity</Label>
                      <Select value={rakhi2Quantity.toString()} onValueChange={(value) => handleQuantityChange("rakhi2", value)}>
                        <SelectTrigger id="rakhi2-qty" className="border-2 focus:border-primary">
                          <SelectValue placeholder="Choose quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num === 0 ? "None" : `${num} Rakhi${num > 1 ? "s" : ""}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {rakhi2Quantity > 0 && (
                      <>
                        <div>
                          <Label htmlFor="rakhi2-color" className="text-sm text-muted-foreground">Color</Label>
                          <Select value={rakhi2Color} onValueChange={setRakhi2Color}>
                            <SelectTrigger id="rakhi2-color" className="border-2 focus:border-primary">
                              <SelectValue placeholder="Choose color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="rakhi2-flavor" className="text-sm text-muted-foreground">Flavor</Label>
                          <Select value={rakhi2Flavor} onValueChange={setRakhi2Flavor}>
                            <SelectTrigger id="rakhi2-flavor" className="border-2 focus:border-primary">
                              <SelectValue placeholder="Choose flavor" />
                            </SelectTrigger>
                            <SelectContent>
                              {flavors.map((flavor) => (
                                <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Service Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-foreground">Service</h4>
                  <div className="flex justify-between text-sm">
                    <span>Divine Angelic Rakhis</span>
                    <span>₹{totalQuantity > 0 ? getPricing(totalQuantity) - 50 : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST</span>
                    <span>₹{totalQuantity > 0 ? 50 : 0}</span>
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
