import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  onDownload: (content: string, filename: string) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, markdownContent, onDownload }) => {
  const filename = "system_spec.md";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export System Specification</DialogTitle>
          <DialogDescription>
            Review the generated markdown specification for your system.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md bg-gray-50 overflow-auto">
          <ReactMarkdown>
            {markdownContent}
          </ReactMarkdown>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onDownload(markdownContent, filename)}>Download as .md</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
