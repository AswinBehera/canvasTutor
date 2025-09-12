import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">About CanvasTutor</h1>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
        CanvasTutor is designed to make system architecture accessible and intuitive for everyone.
        Our mission is to empower users to visualize, simulate, and understand complex system designs
        without needing deep technical expertise.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
          <p className="text-muted-foreground">To be the leading platform for interactive system design and education, fostering innovation and clarity in software development.</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Our Team</h3>
          <p className="text-muted-foreground">We are a passionate team of developers, designers, and educators dedicated to simplifying complex technical concepts.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;