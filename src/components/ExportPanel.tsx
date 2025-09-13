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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import type { AppState } from '@/types';
import { ExportService } from '@/services/ExportService';
import Markdown from 'markdown-to-jsx'; // Import Markdown from markdown-to-jsx

const exporter = new ExportService();

interface ExportPanelProps {
  appState: AppState;
}

/**
 * ExportPanel component provides UI for exporting system design as JSON or Markdown.
 * It integrates with ExportService to generate the content and allows users to
 * review, copy, and download the exported data.
 */
export function ExportPanel({ appState }: ExportPanelProps) {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState('json');

  /**
   * Handles the export process by generating JSON and Markdown content
   * from the current application state.
   */
  const handleExport = () => {
    const jsonString = exporter.exportAsJson(appState);
    setJsonContent(jsonString);
    // Pass the full appState, including chatbotMessages, to generate the spec.
    const markdownString = exporter.generateSpecMarkdown(appState);
    setMarkdownContent(markdownString);
  };

  /**
   * Initiates a file download for the given content.
   * @param content The string content to be downloaded.
   * @param fileName The desired filename for the downloaded file.
   * @param contentType The MIME type of the content (e.g., 'application/json', 'text/markdown').
   */
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  /**
   * Copies the given content to the user's clipboard.
   * @param content The string content to be copied.
   */
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // In a real application, you might add a toast notification here.
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleExport}>Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col"> {/* Adjusted width and height */}
        <DialogHeader>
          <DialogTitle>Export Design</DialogTitle>
          <DialogDescription>
            Review and export your system design as JSON or Markdown.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col"> {/* Added flex-grow and flex-col */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="json" className="flex-grow overflow-auto"> {/* Added flex-grow and overflow-auto */}
            <div className="relative h-full"> {/* Added h-full */}
              <Textarea value={jsonContent} readOnly rows={15} className="font-mono text-xs h-full" /> {/* Added h-full */}
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
          <TabsContent value="markdown" className="flex-grow overflow-auto"> {/* Added flex-grow and overflow-col */}
            <div className="relative h-full"> {/* Added h-full */}
              <ScrollArea className="h-full p-4 border rounded-md bg-gray-50"> {/* Used ScrollArea and adjusted padding */}
                {/* Markdown content is rendered here using markdown-to-jsx */}
                <Markdown className="prose max-w-none">
                  {markdownContent}
                </Markdown>
              </ScrollArea>
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