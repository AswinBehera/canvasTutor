import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Have questions, feedback, or need support? Reach out to us using the form below or directly via email.
      </p>
      <div className="max-w-xl mx-auto p-8 border rounded-lg shadow-lg text-left">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
            <input type="text" id="name" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <input type="email" id="email" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground">Message</label>
            <textarea id="message" rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90">Send Message</button>
        </form>
        <p className="mt-8 text-center text-muted-foreground">
          Or email us directly at <a href="mailto:support@canvastutor.com" className="text-primary hover:underline">support@canvastutor.com</a>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;