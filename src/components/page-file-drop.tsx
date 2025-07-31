import { Loader2, Upload } from 'lucide-react';
import { createFile } from '@/lib/server/files';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/shadcn/dialog';

export function PageFileDrop({ children, afterUpload }: { children: React.ReactNode; afterUpload?: () => void }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPending, startTransition] = useTransition();

  const uploadFiles = useCallback(
    async (e: FileEvent) => {
      startTransition(async () => {
        await Promise.all(getFiles(e).map(createFile));
        afterUpload?.();
      });
    },
    [afterUpload],
  );

  useEffect(() => {
    const handlePageDragOver = (e: DragEvent) => {
      e.preventDefault();
      setShowOverlay(true);
    };

    const handlePageDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) setShowOverlay(false);
    };

    const handlePageDrop = async (e: DragEvent) => {
      e.preventDefault();
      await uploadFiles(e);
      setShowOverlay(false);
    };

    document.addEventListener('dragover', handlePageDragOver);
    document.addEventListener('dragleave', handlePageDragLeave);
    document.addEventListener('drop', handlePageDrop);

    return () => {
      document.removeEventListener('dragover', handlePageDragOver);
      document.removeEventListener('dragleave', handlePageDragLeave);
      document.removeEventListener('drop', handlePageDrop);
    };
  }, [uploadFiles]);

  return (
    <>
      <Dialog
        open={isPending || showOverlay}
        modal
      >
        <DialogTitle className="sr-only">Upload Files</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted-foreground/10 rounded flex items-center justify-center">
              {isPending ? (
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Drop files to upload</p>
              <p className="text-sm text-muted-foreground">Supports PDF, Word, Excel, and image files</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}

function getFiles(e: React.ChangeEvent<HTMLInputElement> | DragEvent) {
  if (e instanceof DragEvent) return getFilesFromDragEvent(e);
  return getFilesFromChangeEvent(e as React.ChangeEvent<HTMLInputElement>);
}

function getFilesFromChangeEvent(e: React.ChangeEvent<HTMLInputElement>) {
  if (!e.target.files) throw new Error('No files selected');
  const files = Array.from(e.target.files);
  if (files.length === 0) throw new Error('No files selected');
  return files;
}

function getFilesFromDragEvent(e: DragEvent) {
  if (!e.dataTransfer?.files) throw new Error('No files selected');
  const files = Array.from(e.dataTransfer.files);
  if (files.length === 0) throw new Error('No files selected');
  return files;
}

type FileEvent = React.ChangeEvent<HTMLInputElement> | DragEvent;
