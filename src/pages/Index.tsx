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
  const [error, setError] = useState<string>("");

  const totalQuantity = rakhi1Quantity + rakhi2Quantity;

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

  const handleQuantityChange = (type: "rakhi1" | "rakhi2", value: string) => {
    const quantity = parseInt(value);
    if (type === "rakhi1") {
      setRakhi1Quantity(quantity);
    } else {
      setRakhi2Quantity(quantity);
    }
    // Clear error when user makes changes
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Raksha Bandhan</h1>
            <Gift className="h-8 w-8 text-secondary" />
          </div>
          <p className="text-muted-foreground">Order beautiful rakhis for your loved ones</p>
        </div>

        {/* Order Form Card */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
            <CardTitle className="text-center text-foreground">Order Rakhis</CardTitle>
            <CardDescription className="text-center">
              Select your rakhis and celebrate the bond of love
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Rakhi 1 Selection */}
            <div className="space-y-2">
              <Label htmlFor="rakhi1" className="text-foreground font-medium">
                Select Rakhi 1 Quantity
              </Label>
              <Select value={rakhi1Quantity.toString()} onValueChange={(value) => handleQuantityChange("rakhi1", value)}>
                <SelectTrigger id="rakhi1" className="border-2 focus:border-primary">
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

            {/* Rakhi 2 Selection */}
            <div className="space-y-2">
              <Label htmlFor="rakhi2" className="text-foreground font-medium">
                Select Rakhi 2 Quantity
              </Label>
              <Select value={rakhi2Quantity.toString()} onValueChange={(value) => handleQuantityChange("rakhi2", value)}>
                <SelectTrigger id="rakhi2" className="border-2 focus:border-primary">
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

            {/* Total Display */}
            <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/30">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Total Rakhis:</span>
                <span className="text-2xl font-bold text-primary">{totalQuantity}</span>
              </div>
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
              Buy Now {totalQuantity > 0 && `(${totalQuantity} Rakhi${totalQuantity > 1 ? "s" : ""})`}
            </Button>

            {/* Info Message */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                Each order can include a maximum of 4 Rakhis in total.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ✨ Strengthen bonds with traditional rakhis ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
