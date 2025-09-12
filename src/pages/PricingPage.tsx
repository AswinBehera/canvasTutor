import React from 'react';

const PricingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Pricing Plans</h1>
      <p className="text-lg text-muted-foreground">Choose the plan that best fits your needs.</p>
      {/* Add pricing tiers here */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 border rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-4">Free Tier</h3>
          <p className="text-5xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/month</span></p>
          <ul className="text-left text-muted-foreground space-y-2 mb-6">
            <li>✓ Limited component generations</li>
            <li>✓ Basic simulation features</li>
            <li>✓ Community support</li>
          </ul>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90">Get Started Free</button>
        </div>
        <div className="p-8 border rounded-lg shadow-lg flex flex-col items-center bg-primary text-primary-foreground">
          <h3 className="text-2xl font-semibold mb-4">Pro Plan</h3>
          <p className="text-5xl font-bold mb-4">$29<span className="text-lg">/month</span></p>
          <ul className="text-left space-y-2 mb-6">
            <li>✓ Unlimited component generations</li>
            <li>✓ Advanced simulation features</li>
            <li>✓ Priority email support</li>
            <li>✓ Export to all formats</li>
          </ul>
          <button className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary-foreground/90">Choose Pro</button>
        </div>
        <div className="p-8 border rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
          <p className="text-5xl font-bold mb-4">Custom</p>
          <ul className="text-left text-muted-foreground space-y-2 mb-6">
            <li>✓ All Pro features</li>
            <li>✓ Dedicated account manager</li>
            <li>✓ On-premise deployment options</li>
            <li>✓ Custom integrations</li>
          </ul>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90">Contact Sales</button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;