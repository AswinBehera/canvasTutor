import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Login to CanvasTutor</h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
        Access your designs and simulations.
      </p>
      <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg text-left">
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <input type="email" id="email" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
            <input type="password" id="password" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90">Login</button>
        </form>
        <p className="mt-8 text-center text-muted-foreground">
          Don't have an account? <a href="#" className="text-primary hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;