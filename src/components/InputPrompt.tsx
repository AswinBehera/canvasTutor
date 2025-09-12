import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from "lucide-react";
import type { InputPromptProps, UserInput } from '@/types';

export function InputPrompt({ onSubmit, isLoading }: InputPromptProps) {
  const [userInput, setUserInput] = useState<UserInput>({
    description: '',
    goal: '',
    features: '',
    techPreferences: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage(null); // Clear messages on input change
    setErrorMessage(null); // Clear messages on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await onSubmit(JSON.stringify(userInput));
      setSuccessMessage('Components generated successfully!');
      setUserInput({ // Reset form on success
        description: '',
        goal: '',
        features: '',
        techPreferences: '',
      });
    } catch (error) {
      setErrorMessage('Failed to generate components. Please try again.');
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">What do you want to build?</Label>
        <Textarea
          id="description"
          name="description"
          value={userInput.description}
          onChange={handleChange}
          placeholder="Describe your application in a few sentences."
          required
        />
      </div>
      <div>
        <Label htmlFor="goal">Goal (Optional)</Label>
        <Input
          id="goal"
          name="goal"
          value={userInput.goal}
          onChange={handleChange}
          placeholder="e.g., A social media app for pet lovers"
        />
      </div>
      <div>
        <Label htmlFor="features">Core Features (Optional)</Label>
        <Input
          id="features"
          name="features"
          value={userInput.features}
          onChange={handleChange}
          placeholder="e.g., User profiles, photo uploads, commenting"
        />
      </div>
      <div>
        <Label htmlFor="techPreferences">Tech Preferences (Optional)</Label>
        <Input
          id="techPreferences"
          name="techPreferences"
          value={userInput.techPreferences}
          onChange={handleChange}
          placeholder="e.g., React, Firebase, or leave blank"
        />
      </div>
      {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Generating...' : 'Generate Components'}
      </Button>
    </form>
  );
}
