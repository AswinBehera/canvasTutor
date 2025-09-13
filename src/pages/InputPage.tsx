import React from 'react';
import { useState } from 'react';
import { InputPrompt } from '../components/InputPrompt';
import { useNavigate } from 'react-router-dom';
import { ComponentExtractorService } from '@/services/ComponentExtractorService';
import { useAppState } from '../context/AppStateContext';
import ErrorBoundary from '../components/ErrorBoundary';

const InputPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setComponents, setCurrentStep, setUserInput } = useAppState();

  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    console.log('User input submitted:', input);
    setUserInput(input);

    try {
      const extractor = new ComponentExtractorService();
      const { nodes, edges } = await extractor.extractComponents(input); // Destructure nodes, edges, confidence, and suggestions
      console.log('Extracted Nodes:', nodes);
      console.log('Extracted Edges:', edges);
      setComponents(nodes, edges); // Pass all to AppStateContext
      setCurrentStep('canvas'); // Update global step
      navigate('/canvas'); // Navigate to canvas page (state is already set in AppStateContext)
    } catch (error) {
      console.error('Error extracting components:', error);
      // Handle error, maybe show a message to the user
      alert('Failed to generate components. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Start Your System Design</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Describe what you want to build, and let our AI suggest the core components.
      </p>
      <div className="max-w-2xl mx-auto">
        <ErrorBoundary errorType="ComponentExtractorError" fallback={<div>Failed to load input prompt.</div>}>
          <InputPrompt onSubmit={handleSubmit} isLoading={isLoading} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default InputPage;