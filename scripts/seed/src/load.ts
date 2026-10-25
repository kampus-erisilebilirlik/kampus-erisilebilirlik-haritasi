import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import type { z } from "zod";

export interface RowError {
  file: string;
  line: number;
  message: string;
}

// CSV'yi okur ve her satırı şemayla doğrular. line: dosyadaki satır numarası (başlık 1. satır)
export function loadCsv<S extends z.ZodType>(file: string, schema: S, content = readFileSync(file, "utf8")) {
  const records: Record<string, string>[] = parse(content.replace(/^﻿/, ""), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  const rows: { line: number; value: z.output<S> }[] = [];
  const errors: RowError[] = [];
  records.forEach((record, i) => {
    const line = i + 2;
    const result = schema.safeParse(record);
    if (result.success) {
      rows.push({ line, value: result.data });
    } else {
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "satır";
        errors.push({ file, line, message: `${field}: ${issue.message}` });
      }
    }
  });
  return { rows, errors };
}
