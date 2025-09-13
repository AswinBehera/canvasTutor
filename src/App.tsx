import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable.tsx'; // New import
import { Routes, Route, Link } from 'react-router-dom';

import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import InputPage from './pages/InputPage';
import { Canvas } from './components/Canvas';
// import { ComponentsPalette } from './components/ComponentsPalette'; // Removed as it's no longer used
import { ReactFlowProvider } from '@xyflow/react'; // Import ReactFlowProvider
import { Chatbot } from './components/Chatbot'; // Import Chatbot
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppState } from './context/AppStateContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ControlsPanel } from './components/ControlsPanel';
import { ExportPanel } from './components/ExportPanel';

import { CostDisplay } from './components/CostDisplay';
import { SaveSessionDialog } from './components/SaveSessionDialog';
import { SessionManager } from './components/SessionManager';
import InitialChatbotMessage from './components/InitialChatbotMessage'; // New import


function App() {
  const location = useLocation();
      const { state, onNodesChange, onEdgesChange, onConnect, onNodeDrop, setComponents, onControlChange, onPlaySimulation, onToggleShowMath, onSendChatbotMessage, saveCurrentSession, onSendAdaMessage } = useAppState();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // This useEffect is now responsible for setting the components in the global state
  // when navigating to the canvas page with components in location.state.
  useEffect(() => {
    type CanvasLocationState = {
      components?: any[];
      initialEdges?: any[];
    };

    const locState = location.state as CanvasLocationState;
    if (location.pathname === '/canvas' && location.state && locState.components) {
      setComponents(locState.components, locState.initialEdges || []);
    }
  }, [location.pathname, location.state?.components, location.state?.initialEdges, setComponents]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {/* Global Header (only for non-canvas pages) */}
      {location.pathname !== '/canvas' && (
        <header className="container mx-auto px-4 py-6 flex justify-between items-center border-b border-gray-200">
          <Link to="/" className="text-2xl font-bold text-primary">CanvasTutor</Link>
          <nav className="space-x-6 hidden md:block">
            <Link to="/features" className="text-sm font-medium hover:text-primary">Features</Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary">About Us</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">Contact</Link>
          </nav>
          <div className="space-x-4">
            <Link to="/get-started"><Button className="text-sm font-medium">Get Started</Button></Link>
            <Link to="/sessions"><Button className="text-sm font-medium">Sessions</Button></Link>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
                Visualize, Simulate, and Master System Architecture.
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Transform complex ideas into clear, actionable system designs with CanvasTutor's intuitive AI-powered platform.
              </p>
              <div className="space-x-4">
                <Link to="/get-started"><Button size="lg" variant="default" className="bg-black text-white text-lg px-8 py-4">Start Building Your System</Button></Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">Watch a Demo</Button>
              </div>
              {/* Placeholder for illustration/screenshot */}
              <div className="mt-16 bg-gray-100 h-96 rounded-lg flex items-center justify-center text-muted-foreground">
                <img src="/overview.png" alt="Overview of the system" />
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-20 bg-gray-50 rounded-lg">
              <h2 className="text-4xl font-bold text-center mb-12">Powerful Features to Accelerate Your Design</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <Card className="text-center p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold mb-2">AI-Powered Component Generation</CardTitle>
                    <CardDescription>Intelligent Design Suggestions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Describe your app in plain language, and our AI instantly suggests core components tailored to your needs.</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold mb-2">Interactive Canvas & Data Flow</CardTitle>
                    <CardDescription>Drag, Drop, and Connect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Visually compose your system on an intuitive canvas, with animated data flows bringing your architecture to life.</p>
                  </CardContent>
                  </Card>
                <Card className="text-center p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold mb-2">Real-time Simulation & Insights</CardTitle>
                    <CardDescription>Understand Performance Instantly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Adjust parameters like traffic and instances to simulate real-world scenarios and get immediate, jargon-free feedback.</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold mb-2">Developer-Ready Export</CardTitle>
                    <CardDescription>Seamless Handoff</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Export your designs as human-readable specs and developer-friendly requirements for easy implementation.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-4 py-20 text-center">
              <h2 className="text-4xl font-bold mb-12">How CanvasTutor Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center">
                  <div className="text-5xl text-primary mb-4">1</div>
                  <h3 className="text-2xl font-semibold mb-2">Describe</h3>
                  <p className="text-muted-foreground">Tell us what you want to build in simple terms.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl text-primary mb-4">2</div>
                  <h3 className="text-2xl font-semibold mb-2">Design</h3>
                  <p className="text-muted-foreground">Drag and drop components onto the canvas and connect them.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl text-primary mb-4">3</div>
                  <h3 className="text-2xl font-semibold mb-2">Simulate</h3>
                  <p className="text-muted-foreground">Adjust controls and see the real-time impact on performance.</p>
                </div>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="container mx-auto px-4 py-20 text-center bg-primary text-primary-foreground rounded-lg">
              <h2 className="text-4xl font-bold mb-6">Ready to Design Your Next Big Idea?</h2>
              <p className="text-xl mb-10 max-w-3xl mx-auto">
                Join thousands of innovators simplifying system architecture with CanvasTutor.
              </p>
              <Link to="/get-started"><Button size="lg" variant="secondary" className="text-lg px-8 py-4">Get Started for Free</Button></Link>
            </section>
          </>
        } />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        <Route path="/get-started" element={<InputPage />} />
        <Route path="/sessions" element={<SessionManager />} />
        <Route path="/canvas" element={
          <>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              
              {/* Controls Panel (normal flow) */}
              <div className="w-full py-1 px-2 flex items-center justify-center bg-white z-20 shadow-xs">
                <ControlsPanel
                  controls={state.controls}
                  onControlChange={onControlChange}
                  onPlaySimulation={onPlaySimulation}
                  isSimulating={state.isSimulating}
                  onToggleShowMath={onToggleShowMath}
                  showMath={state.showMath}
                  onSaveSession={() => setIsSaveDialogOpen(true)}
                />
              </div>
              <ResizablePanelGroup direction="horizontal" className="flex-grow"> {/* Changed to horizontal */}
                <ResizablePanel defaultSize={30} minSize={20}> {/* Left Panel */}
                  <ResizablePanelGroup direction="vertical" className="h-full border-r">
                    <ResizablePanel defaultSize={40}> {/* CostDisplay takes 40% */}                      <div className="flex h-full items-center justify-center flex-col">                        <CostDisplay totalCost={state.totalCost} breakdown={state.costBreakdown} />                      </div>                    </ResizablePanel>                    <ResizableHandle />                    <ResizablePanel defaultSize={60}> {/* Chatbot takes 60% */}                      <div className="flex h-full items-center justify-center p-6 flex-col">                        <h3 className='p-2 mb-2 ml-1 font-semibold'>Ada\'s Insights</h3>                        <div className="flex-grow overflow-y-auto w-full">                          <Chatbot onSendMessage={onSendChatbotMessage} messages={state.chatbotMessages || []} isResponding={state.isChatbotResponding} />                        </div>                      </div>                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={70}> {/* Canvas Area */}
                  <div style={{ flexGrow: 1, height: '100%' }}> {/* Removed flexGrow: 1 from here, added to parent */}
                    {state.isSaving && (
                      <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md z-50">
                        Saving...
                      </div>
                    )}
                    <ErrorBoundary errorType="CanvasError" fallback={<div>Error rendering canvas.</div>}>
                        <ReactFlowProvider>
                          <Canvas nodes={state.canvasNodes} edges={state.canvasEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeDrop={onNodeDrop} showMath={state.showMath} />
                        </ReactFlowProvider>
                    </ErrorBoundary>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
            <SaveSessionDialog
              isOpen={isSaveDialogOpen}
              onClose={() => setIsSaveDialogOpen(false)}
              onSave={(sessionName) => {
                  saveCurrentSession(sessionName);
                  setIsSaveDialogOpen(false);
              }}
            />
            <InitialChatbotMessage onSendAdaMessage={onSendAdaMessage} userInput={state.userInput} /> {/* New component for initial message */}
          </>
        } />
      </Routes>

      {/* Footer (only for non-canvas pages) */}
      {location.pathname !== '/canvas' && (
        <footer className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm border-t border-gray-200">
          <p>&copy; {new Date().getFullYear()} CanvasTutor. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;