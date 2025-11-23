import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Calculator } from "@/components/Calculator";

const Index = () => {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!showCalculator ? (
        <Hero onStartCalculating={() => setShowCalculator(true)} />
      ) : (
        <Calculator />
      )}
    </div>
  );
};

export default Index;
