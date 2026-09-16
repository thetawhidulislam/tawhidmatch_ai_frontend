"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ResumeUploadCardProps {
  onUpload: (file: File) => Promise<void>;
}

function validateFile(file: File): boolean {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    toast.error("Please choose a PDF file.");
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    toast.error("Your resume must be 5MB or smaller.");
    return false;
  }
  return true;
}

export function ResumeUploadCard({ onUpload }: ResumeUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const chooseFile = (file: File | undefined) => {
    if (file && validateFile(file)) setSelectedFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch {
      // The page mutation owns the user-facing upload error toast.
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Drop your PDF here or browse</p>
            <p className="mt-1 text-sm text-muted-foreground">PDF only, up to 5MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileUp className="size-4" aria-hidden="true" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
        )}
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}
