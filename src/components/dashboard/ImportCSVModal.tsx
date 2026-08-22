"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, AlertTriangle, CheckCircle2, Download, Loader2 } from "lucide-react";
import {
  parseCSV, validateCSVRows, generateCSV, downloadCSV,
  type CSVValidationResult, type FieldDef,
} from "@/lib/csv";

type ModuleType = "reviews" | "complaints" | "coupons";

interface ImportCSVModalProps {
  open: boolean;
  onClose: () => void;
  module: ModuleType;
  fields: FieldDef[];
  uniqueFields?: string[];
  onImport: (records: Record<string, string>[]) => Promise<{ success: number; failed: number }>;
}

const MODULE_LABELS: Record<ModuleType, string> = {
  reviews: "Review Inbox",
  complaints: "Customer Concerns",
  coupons: "Verify Coupons",
};

export function ImportCSVModal({ open, onClose, module, fields, uniqueFields, onImport }: ImportCSVModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [validation, setValidation] = useState<CSVValidationResult | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setValidation(null);
    setImportResult(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      setHeaders(h);
      setRawRows(r);

      const result = validateCSVRows(h, r, fields, uniqueFields);
      setValidation(result);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!validation || validation.valid.length === 0) return;
    setStep("importing");
    const result = await onImport(validation.valid);
    setImportResult(result);
    setStep("done");
  };

  const handleDownloadErrors = () => {
    if (!validation) return;
    const errorHeaders = ["row", "field", "message", "value"];
    const allErrors = [
      ...validation.errors.map((e) => [String(e.row), e.field, e.message, e.value || ""]),
      ...validation.duplicates.map((d) => [String(d.row), d.field, "Duplicate value", d.value]),
    ];
    const csv = generateCSV(errorHeaders, allErrors);
    downloadCSV(csv, `${module}-import-errors.csv`);
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = fields.map((f) => f.name);
    const csv = generateCSV(templateHeaders, []);
    downloadCSV(csv, `${module}-template.csv`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="px-6 pt-5 pb-4 flex items-start justify-between flex-shrink-0">
                <div>
                  <h2 className="text-[15px] font-bold text-[#111]">Import CSV — {MODULE_LABELS[module]}</h2>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">Upload a CSV file to import records</p>
                </div>
                <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-[#F3F4F6]" />

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Upload step */}
                {step === "upload" && (
                  <div className="space-y-4">
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-10 text-center cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#F9FAFB] transition-all"
                    >
                      <Upload className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
                      <p className="text-[13px] text-[#374151] font-medium mb-1">Drop your CSV file here or click to browse</p>
                      <p className="text-[11px] text-[#9CA3AF]">Accepts .csv files only</p>
                      <input ref={fileRef} type="file" accept=".csv" className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                    </div>

                    <div className="flex justify-center">
                      <button onClick={handleDownloadTemplate}
                        className="flex items-center gap-1.5 text-[11px] text-[#7C3AED] font-semibold hover:underline">
                        <Download className="w-3 h-3" /> Download Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview step */}
                {step === "preview" && validation && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
                      <FileText className="w-5 h-5 text-[#7C3AED]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#111] truncate">{fileName}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{rawRows.length} rows found &middot; {headers.length} columns</p>
                      </div>
                      <button onClick={reset} className="text-[11px] text-[#6B7280] hover:text-[#111] font-medium">Change file</button>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-[#E5E7EB] p-3 text-center">
                        <p className="text-[18px] font-bold text-[#10B981]">{validation.valid.length}</p>
                        <p className="text-[10px] text-[#6B7280] font-medium">Valid</p>
                      </div>
                      <div className="rounded-xl border border-[#E5E7EB] p-3 text-center">
                        <p className="text-[18px] font-bold text-[#EF4444]">{validation.errors.length}</p>
                        <p className="text-[10px] text-[#6B7280] font-medium">Errors</p>
                      </div>
                      <div className="rounded-xl border border-[#E5E7EB] p-3 text-center">
                        <p className="text-[18px] font-bold text-[#F59E0B]">{validation.duplicates.length}</p>
                        <p className="text-[10px] text-[#6B7280] font-medium">Duplicates</p>
                      </div>
                    </div>

                    {/* Errors */}
                    {(validation.errors.length > 0 || validation.duplicates.length > 0) && (
                      <div className="rounded-xl border border-[#FDBA74] bg-[#FFF7ED] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                          <h4 className="text-[12px] font-semibold text-[#9A3412]">Issues Found</h4>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto space-y-1.5">
                          {validation.errors.slice(0, 50).map((err, i) => (
                            <div key={`e-${i}`} className="text-[11px] text-[#9A3412]">
                              <span className="font-mono font-bold">Row {err.row}:</span> {err.message}
                              {err.value && <span className="text-[#B45309]"> ({err.value})</span>}
                            </div>
                          ))}
                          {validation.duplicates.slice(0, 20).map((dup, i) => (
                            <div key={`d-${i}`} className="text-[11px] text-[#B45309]">
                              <span className="font-mono font-bold">Row {dup.row}:</span> Duplicate {dup.field}: {dup.value}
                            </div>
                          ))}
                          {(validation.errors.length > 50 || validation.duplicates.length > 20) && (
                            <p className="text-[11px] text-[#9A3412] font-medium mt-2">
                              ... and {validation.errors.length + validation.duplicates.length - 70} more issues
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data preview table */}
                    {validation.valid.length > 0 && (
                      <div>
                        <h4 className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider mb-2">
                          Preview ({Math.min(validation.valid.length, 10)} of {validation.valid.length} valid records)
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-[#F9FAFB]">
                                {headers.filter((h) => fields.some((f) => f.name === h)).map((h) => (
                                  <th key={h} className="px-3 py-2 text-left font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {validation.valid.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-t border-[#F3F4F6]">
                                  {headers.filter((h) => fields.some((f) => f.name === h)).map((h) => (
                                    <td key={h} className="px-3 py-2 text-[#374151] max-w-[200px] truncate">{row[h] || "—"}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Importing step */}
                {step === "importing" && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin mb-4" />
                    <p className="text-[14px] font-medium text-[#111]">Importing records...</p>
                    <p className="text-[12px] text-[#6B7280] mt-1">Please wait, this may take a moment</p>
                  </div>
                )}

                {/* Done step */}
                {step === "done" && importResult && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#111] mb-2">Import Complete</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-xl border border-[#E5E7EB] p-4 text-center">
                        <p className="text-[24px] font-bold text-[#10B981]">{importResult.success}</p>
                        <p className="text-[11px] text-[#6B7280] font-medium">Imported</p>
                      </div>
                      <div className="rounded-xl border border-[#E5E7EB] p-4 text-center">
                        <p className="text-[24px] font-bold text-[#EF4444]">{importResult.failed}</p>
                        <p className="text-[11px] text-[#6B7280] font-medium">Failed</p>
                      </div>
                    </div>
                    {validation && (validation.errors.length > 0 || validation.duplicates.length > 0) && (
                      <button onClick={handleDownloadErrors}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[12px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] transition-colors">
                        <Download className="w-4 h-4" /> Download Error Report
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="h-px bg-[#F3F4F6]" />
              <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
                <button onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#6B7280] uppercase tracking-[0.12em] font-medium hover:text-[#111] hover:bg-[#E5E7EB] transition-all">
                  {step === "done" ? "Close" : "Cancel"}
                </button>
                {step === "preview" && validation && validation.valid.length > 0 && (
                  <button onClick={handleImport}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all">
                    Import {validation.valid.length} Records
                  </button>
                )}
                {step === "done" && (
                  <button onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold">
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
