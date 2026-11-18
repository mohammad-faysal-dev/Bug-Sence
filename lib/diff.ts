export type DiffType = "normal" | "add" | "delete";

export interface UnifiedDiffLine {
  type: DiffType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface SideBySideDiffRow {
  left: {
    lineNumber?: number;
    content: string;
    type: "normal" | "delete" | "empty";
  };
  right: {
    lineNumber?: number;
    content: string;
    type: "normal" | "add" | "empty";
  };
}

/**
 * Standard Longest Common Subsequence (LCS) line diff algorithm.
 */
export function computeUnifiedDiff(original: string, modified: string): UnifiedDiffLine[] {
  const origLines = original ? original.split(/\r?\n/) : [];
  const modLines = modified ? modified.split(/\r?\n/) : [];

  // If one of them is empty
  if (origLines.length === 0) {
    return modLines.map((content, idx) => ({
      type: "add" as const,
      content,
      newLineNumber: idx + 1,
    }));
  }
  if (modLines.length === 0) {
    return origLines.map((content, idx) => ({
      type: "delete" as const,
      content,
      oldLineNumber: idx + 1,
    }));
  }

  const n = Math.min(origLines.length, 600);
  const m = Math.min(modLines.length, 600);

  // Compute DP matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const result: UnifiedDiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      result.push({
        type: "normal",
        content: origLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({
        type: "add",
        content: modLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.push({
        type: "delete",
        content: origLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Align lines for side-by-side diff display.
 */
export function computeSideBySideDiff(original: string, modified: string): SideBySideDiffRow[] {
  const unified = computeUnifiedDiff(original, modified);
  const rows: SideBySideDiffRow[] = [];

  let k = 0;
  while (k < unified.length) {
    const item = unified[k];

    if (item.type === "normal") {
      rows.push({
        left: {
          lineNumber: item.oldLineNumber,
          content: item.content,
          type: "normal",
        },
        right: {
          lineNumber: item.newLineNumber,
          content: item.content,
          type: "normal",
        },
      });
      k++;
    } else if (item.type === "delete") {
      // Check if immediate next is an addition (replacement)
      const nextItem = unified[k + 1];
      if (nextItem && nextItem.type === "add") {
        rows.push({
          left: {
            lineNumber: item.oldLineNumber,
            content: item.content,
            type: "delete",
          },
          right: {
            lineNumber: nextItem.newLineNumber,
            content: nextItem.content,
            type: "add",
          },
        });
        k += 2;
      } else {
        rows.push({
          left: {
            lineNumber: item.oldLineNumber,
            content: item.content,
            type: "delete",
          },
          right: {
            content: "",
            type: "empty",
          },
        });
        k++;
      }
    } else if (item.type === "add") {
      rows.push({
        left: {
          content: "",
          type: "empty",
        },
        right: {
          lineNumber: item.newLineNumber,
          content: item.content,
          type: "add",
        },
      });
      k++;
    }
  }

  return rows;
}
