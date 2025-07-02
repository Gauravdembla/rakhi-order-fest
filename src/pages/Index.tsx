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
      <div className="text-center py-8 px-4">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Raksha Bandhan</h1>
          <Gift className="h-8 w-8 text-secondary" />
        </div>
        <p className="text-muted-foreground">Order beautiful rakhis for your loved ones</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side - Order Form */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
                <CardTitle className="text-center text-foreground">Order Rakhis</CardTitle>
                <CardDescription className="text-center">
                  Select your Special Divine Angelic Rakhis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Rakhi 1 Selection */}
                <div className="space-y-4">
                  <Label className="text-foreground font-medium text-lg">
                    Special Divine Angelic Rakhi 1
                  </Label>
                  
                  <div className="space-y-2">
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
                      <div className="space-y-2">
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

                      <div className="space-y-2">
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

                {/* Rakhi 2 Selection */}
                <div className="space-y-4">
                  <Label className="text-foreground font-medium text-lg">
                    Special Divine Angelic Rakhi 2
                  </Label>
                  
                  <div className="space-y-2">
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
                      <div className="space-y-2">
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

                      <div className="space-y-2">
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

                {/* Total and Pricing Display */}
                <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Total Rakhis:</span>
                    <span className="text-2xl font-bold text-primary">{totalQuantity}</span>
                  </div>
                  
                  {totalQuantity > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Price:</span>
                        <span className="text-2xl font-bold text-primary">₹{getPricing(totalQuantity)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          🚚 Shipping Charges Included
                        </span>
                      </div>
                    </>
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
                  Buy Now {totalQuantity > 0 && `- ₹${getPricing(totalQuantity)}`}
                </Button>

                {/* Info Message */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    Each order can include a maximum of 4 Rakhis in total.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Rakhi Images and Description */}
          <div className="order-1 lg:order-2">
            {/* Scrollable Image Gallery */}
            <div className="mb-6">
              <div className="h-80 overflow-y-auto rounded-lg border-2 border-primary/20 p-4 bg-card">
                <div className="grid grid-cols-2 gap-4">
                  {rakhiImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Special Divine Angelic Rakhi ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">Divine Rakhi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heading and Description */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center text-foreground mb-4">
                  Special Divine Angelic Rakhis
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    Experience the divine bond of sibling love with our handcrafted Special Divine Angelic Rakhis. Each rakhi is blessed with sacred fragrances and adorned with celestial colors that symbolize protection, love, and prosperity.
                  </p>
                  <p className="leading-relaxed">
                    Our collection features traditional designs infused with modern elegance, available in beautiful color combinations like Red & Gold, Pink & Silver, and more. Each rakhi comes with enchanting flavors including Rose, Sandalwood, Jasmine, Lavender, and Vanilla.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">✨ Special Features:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Handcrafted with love and devotion</li>
                      <li>• Blessed with sacred fragrances</li>
                      <li>• Premium quality materials</li>
                      <li>• Multiple color and flavor options</li>
                      <li>• Free shipping across India</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Decorative Footer */}
      <div className="text-center pb-6">
        <p className="text-sm text-muted-foreground">
          ✨ Strengthen bonds with traditional divine rakhis ✨
        </p>
      </div>
    </div>
  );
};

export default Index;
