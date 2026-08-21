export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function escapeCSVField(value: string): string {
  let safe = value;
  if (/^[=+\-@\t\r]/.test(safe)) {
    safe = "'" + safe;
  }
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function generateCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSVField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSVField).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface CSVValidationResult {
  valid: Record<string, string>[];
  errors: CSVValidationError[];
  duplicates: { row: number; field: string; value: string }[];
}

export interface FieldDef {
  name: string;
  required?: boolean;
  type?: "string" | "number" | "email" | "boolean" | "date" | "enum";
  enumValues?: string[];
  maxLength?: number;
}

export function validateCSVRows(
  headers: string[],
  rows: string[][],
  fields: FieldDef[],
  uniqueFields?: string[],
): CSVValidationResult {
  const valid: Record<string, string>[] = [];
  const errors: CSVValidationError[] = [];
  const duplicates: { row: number; field: string; value: string }[] = [];

  const fieldMap = new Map(fields.map((f) => [f.name, f]));
  const requiredFields = fields.filter((f) => f.required).map((f) => f.name);

  const missingHeaders = requiredFields.filter((f) => !headers.includes(f));
  if (missingHeaders.length > 0) {
    missingHeaders.forEach((f) => {
      errors.push({ row: 0, field: f, message: `Missing required column: ${f}` });
    });
    return { valid, errors, duplicates };
  }

  const seenValues = new Map<string, Set<string>>();
  if (uniqueFields) {
    uniqueFields.forEach((f) => seenValues.set(f, new Set()));
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const record: Record<string, string> = {};
    let rowValid = true;

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = row[j] || "";
      const field = fieldMap.get(header);

      if (!field) {
        record[header] = value;
        continue;
      }

      if (field.required && !value.trim()) {
        errors.push({ row: rowNum, field: header, message: `Required field "${header}" is empty` });
        rowValid = false;
        continue;
      }

      if (!value.trim()) {
        record[header] = "";
        continue;
      }

      if (field.maxLength && value.length > field.maxLength) {
        errors.push({
          row: rowNum, field: header,
          message: `"${header}" exceeds max length of ${field.maxLength}`,
          value: value.slice(0, 50) + "...",
        });
        rowValid = false;
        continue;
      }

      if (field.type === "number" && isNaN(Number(value))) {
        errors.push({ row: rowNum, field: header, message: `"${header}" must be a number`, value });
        rowValid = false;
        continue;
      }

      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push({ row: rowNum, field: header, message: `"${header}" is not a valid email`, value });
        rowValid = false;
        continue;
      }

      if (field.type === "enum" && field.enumValues && !field.enumValues.includes(value.toLowerCase())) {
        errors.push({
          row: rowNum, field: header,
          message: `"${header}" must be one of: ${field.enumValues.join(", ")}`,
          value,
        });
        rowValid = false;
        continue;
      }

      if (field.type === "date" && value) {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
          errors.push({ row: rowNum, field: header, message: `"${header}" is not a valid date`, value });
          rowValid = false;
          continue;
        }
      }

      record[header] = value;
    }

    if (uniqueFields && rowValid) {
      for (const uf of uniqueFields) {
        const val = record[uf];
        if (val) {
          const seen = seenValues.get(uf)!;
          if (seen.has(val.toLowerCase())) {
            duplicates.push({ row: rowNum, field: uf, value: val });
            rowValid = false;
          } else {
            seen.add(val.toLowerCase());
          }
        }
      }
    }

    if (rowValid) {
      valid.push(record);
    }
  }

  return { valid, errors, duplicates };
}

export const REVIEW_FIELDS: FieldDef[] = [
  { name: "star_rating", required: true, type: "number" },
  { name: "selected_review_text", required: true, type: "string", maxLength: 5000 },
  { name: "session_token", type: "string", maxLength: 200 },
];

export const COMPLAINT_FIELDS: FieldDef[] = [
  { name: "complaint_text", required: true, type: "string", maxLength: 5000 },
  { name: "star_rating", required: true, type: "number" },
  { name: "status", type: "enum", enumValues: ["open", "in_progress", "resolved", "closed"] },
  { name: "contact_name", type: "string", maxLength: 200 },
  { name: "contact_email", type: "email", maxLength: 320 },
  { name: "contact_phone", type: "string", maxLength: 20 },
  { name: "is_anonymous", type: "boolean" },
  { name: "business_notes", type: "string", maxLength: 5000 },
];

export const COUPON_FIELDS: FieldDef[] = [
  { name: "coupon_code", required: true, type: "string", maxLength: 100 },
  { name: "reward_value", required: true, type: "string", maxLength: 500 },
  { name: "reward_type", type: "string", maxLength: 100 },
  { name: "is_redeemed", type: "boolean" },
  { name: "issued_at", type: "date" },
  { name: "expires_at", required: true, type: "date" },
];
