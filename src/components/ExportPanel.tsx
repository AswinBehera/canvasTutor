
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import type { AppState } from '@/types';
import { ExportService } from '@/services/ExportService';

const exporter = new ExportService();

interface ExportPanelProps {
  appState: AppState;
}

export function ExportPanel({ appState }: ExportPanelProps) {
  const [jsonContent, setJsonContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [activeTab, setActiveTab] = useState('json');

  const handleExport = () => {
    const jsonString = exporter.exportAsJson(appState);
    setJsonContent(jsonString);
    const markdownString = exporter.exportAsMarkdown(appState);
    setMarkdownContent(markdownString);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // Optionally, add a visual feedback for copy
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleExport}>Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Design</DialogTitle>
          <DialogDescription>
            Export your system design as JSON or Markdown.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="json">
            <div className="relative">
              <Textarea value={jsonContent} readOnly rows={15} className="font-mono text-xs" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(jsonContent)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => downloadFile(jsonContent, 'design.json', 'application/json')} className="mt-2 w-full">Download JSON</Button>
          </TabsContent>
          <TabsContent value="markdown">
            <div className="relative">
              <Textarea value={markdownContent} readOnly rows={15} className="font-mono text-xs" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(markdownContent)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => downloadFile(markdownContent, 'design.md', 'text/markdown')} className="mt-2 w-full">Download Markdown</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
