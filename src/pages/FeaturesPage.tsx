import React from 'react';

const FeaturesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Our Features</h1>
      <p className="text-lg text-muted-foreground">Explore the powerful features that make CanvasTutor your go-to system design tool.</p>
      {/* Add more detailed feature content here */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
          <p className="text-muted-foreground">Get intelligent component recommendations based on your project description.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Interactive Canvas</h3>
          <p className="text-muted-foreground">Drag, drop, and connect components with animated data flows.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Real-time Simulation</h3>
          <p className="text-muted-foreground">Understand performance impacts with adjustable parameters and instant feedback.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Developer-Ready Export</h3>
          <p className="text-muted-foreground">Generate human-readable specs and coding agent-friendly requirements.</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;