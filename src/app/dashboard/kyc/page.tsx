"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// ─── ID type selector ────────────────────────────────────────────────────────
type IdType = "GOVERNMENT_ID" | "PASSPORT" | "DRIVING_LICENSE";

const ID_TYPES: { value: IdType; label: string; files: { type: string; label: string }[] }[] = [
  {
    value: "GOVERNMENT_ID",
    label: "Government ID (National ID Card)",
    files: [
      { type: "ID_CARD_FRONT", label: "Front side of ID" },
      { type: "ID_CARD_BACK",  label: "Back side of ID"  },
    ],
  },
  {
    value: "PASSPORT",
    label: "Passport",
    files: [
      { type: "PASSPORT", label: "Photo page of passport" },
    ],
  },
  {
    value: "DRIVING_LICENSE",
    label: "Driving Licence",
    files: [
      { type: "DRIVING_LICENSE_FRONT", label: "Front side of licence" },
      { type: "DRIVING_LICENSE_BACK",  label: "Back side of licence"  },
    ],
  },
];

// ─── Static docs (always required) ──────────────────────────────────────────
const STATIC_DOCS = [
  {
    type: "SELFIE",
    label: "Selfie with ID",
    description: "A clear photo of yourself holding your identity document next to your face.",
  },
  {
    type: "PROOF_OF_ADDRESS",
    label: "Proof of Address",
    description: "A utility bill, council rates notice, or bank statement dated within the last 3 months showing your full name and address.",
  },
  {
    type: "SOURCE_OF_FUNDS",
    label: "Source of Funds",
    description:
      "Required under AUSTRAC AML/CTF regulations. Acceptable documents include: last 3 months' bank statements, savings account statements, evidence of inheritance or gifts, revenue from investment activity, pension statements, or recent payslips.",
  },
];

export default function KYCPage() {
  const [idType, setIdType] = useState<IdType>("GOVERNMENT_ID");
  const [idDropdownOpen, setIdDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

  const selectedIdType = ID_TYPES.find((t) => t.value === idType)!;

  // All required doc types for current selection
  const allRequiredTypes = [
    ...selectedIdType.files.map((f) => f.type),
    ...STATIC_DOCS.map((d) => d.type),
  ];

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

  const allUploaded = allRequiredTypes.every((t) => uploaded[t]);

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
        <p className="text-muted-foreground">
          Upload the required documents to verify your identity (AUSTRAC requirement)
        </p>
      </div>

      {/* ── Step 1: Choose ID type ── */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-blue-400" />
            Step 1 — Choose your identity document type
          </CardTitle>
          <CardDescription>Select the type of ID you would like to use for verification.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIdDropdownOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm transition hover:border-blue-500/40"
            >
              <span>{selectedIdType.label}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${idDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {idDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-card shadow-xl">
                {ID_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setIdType(t.value);
                      setIdDropdownOpen(false);
                      // Clear previously uploaded ID files when switching type
                      setUploaded((prev) => {
                        const next = { ...prev };
                        ID_TYPES.forEach((it) => it.files.forEach((f) => delete next[f.type]));
                        return next;
                      });
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/5 ${
                      t.value === idType ? "text-blue-400" : "text-foreground"
                    }`}
                  >
                    {t.value === idType && <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />}
                    {t.value !== idType && <span className="h-4 w-4 shrink-0" />}
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── ID upload cards (dynamic based on selection) ── */}
      {selectedIdType.files.map((file) => (
        <UploadCard
          key={file.type}
          docType={file.type}
          label={file.label}
          description={`Upload a clear, unobstructed photo. Ensure all four corners are visible and the text is readable.`}
          uploading={uploading}
          uploaded={uploaded}
          onUpload={handleUpload}
        />
      ))}

      {/* ── Static docs ── */}
      {STATIC_DOCS.map((doc) => (
        <UploadCard
          key={doc.type}
          docType={doc.type}
          label={doc.label}
          description={doc.description}
          uploading={uploading}
          uploaded={uploaded}
          onUpload={handleUpload}
        />
      ))}

      {/* ── Submit ── */}
      <Button
        onClick={handleSubmit}
        disabled={!allUploaded || uploading === "submit"}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {uploading === "submit" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {allUploaded ? "Submit for Review" : "Upload all documents to continue"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Documents are stored securely and used solely for identity verification purposes.
      </p>
    </div>
  );
}

// ─── Reusable upload card ────────────────────────────────────────────────────
function UploadCard({
  docType, label, description, uploading, uploaded, onUpload,
}: {
  docType: string;
  label: string;
  description: string;
  uploading: string | null;
  uploaded: Record<string, boolean>;
  onUpload: (type: string, file: File) => void;
}) {
  const isUploaded = !!uploaded[docType];
  const isUploading = uploading === docType;

  return (
    <Card className={`border-white/10 bg-white/5 transition ${isUploaded ? "border-green-500/30" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isUploaded
            ? <CheckCircle className="h-5 w-5 text-green-400" />
            : <FileText className="h-5 w-5 text-muted-foreground" />}
          {label}
        </CardTitle>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Label
          htmlFor={docType}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-sm transition ${
            isUploaded
              ? "border-green-500/30 text-green-400"
              : "border-white/20 text-muted-foreground hover:border-blue-500/50 hover:text-blue-400"
          }`}
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : isUploaded ? (
            <><CheckCircle className="h-4 w-4" /> Uploaded — click to replace</>
          ) : (
            <><Upload className="h-4 w-4" /> Click to upload</>
          )}
        </Label>
        <input
          id={docType}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(docType, file);
          }}
        />
      </CardContent>
    </Card>
  );
}
