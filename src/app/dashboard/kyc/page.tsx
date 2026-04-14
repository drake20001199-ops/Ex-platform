"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const REQUIRED_DOCS = [
  { type: "PASSPORT", label: "Passport or Government ID", description: "Clear photo of your valid identification" },
  { type: "SELFIE", label: "Selfie with ID", description: "Photo of yourself holding your ID document" },
  { type: "PROOF_OF_ADDRESS", label: "Proof of Address", description: "Utility bill or bank statement (last 3 months)" },
];

export default function KYCPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  async function handleUpload(docType: string, file: File) {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", docType);

      const res = await fetch("/api/kyc/upload", { method: "POST", body: formData });
      if (!res.ok) { toast.error("Upload failed"); return; }
      setUploaded((prev) => ({ ...prev, [docType]: true }));
      toast.success("Document uploaded");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(null);
    }
  }

  const allUploaded = REQUIRED_DOCS.every((d) => uploaded[d.type]);

  async function handleSubmit() {
    setUploading("submit");
    try {
      const res = await fetch("/api/kyc/submit", { method: "POST" });
      if (!res.ok) { toast.error("Submission failed"); return; }
      toast.success("Documents submitted for review!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Identity Verification</h1>
        <p className="text-muted-foreground">Upload documents to verify your identity (AUSTRAC requirement)</p>
      </div>

      {REQUIRED_DOCS.map((doc) => (
        <Card key={doc.type} className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {uploaded[doc.type] ? <CheckCircle className="h-5 w-5 text-green-400" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
              {doc.label}
            </CardTitle>
            <CardDescription>{doc.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor={doc.type} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-8 text-sm text-muted-foreground hover:border-blue-500/50 hover:text-blue-400 transition">
              {uploading === doc.type ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {uploaded[doc.type] ? "Replace file" : "Click to upload"}
            </Label>
            <input id={doc.type} type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(doc.type, f); }} />
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSubmit} disabled={!allUploaded || uploading === "submit"}
        className="w-full bg-blue-600 hover:bg-blue-700">
        {uploading === "submit" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit for Verification
      </Button>
    </div>
  );
}
