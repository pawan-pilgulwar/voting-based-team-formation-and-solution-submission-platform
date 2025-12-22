export const getTemplateForLanguage = (language: string): string => {
  const templates: Record<string, string> = {
    python: `# Python Solution\n\ndef solve():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
    javascript: `// JavaScript Solution\n\nfunction solve() {\n  // Your code here\n}\n\nsolve();\n`,
    typescript: `// TypeScript Solution\n\nfunction solve(): void {\n  // Your code here\n}\n\nsolve();\n`,
    java: `public class Main {\n  public static void main(String[] args) {\n    // Your code here\n  }\n}\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}\n`,
    c: `#include <stdio.h>\n\nint main() {\n  // Your code here\n  return 0;\n}\n`,
    go: `package main\n\nimport \"fmt\"\n\nfunc main() {\n  // Your code here\n  fmt.Println()\n}\n`,
    rust: `fn main() {\n  // Your code here\n}\n`,
    csharp: `using System;\nclass Program {\n  static void Main() {\n    // Your code here\n  }\n}\n`,
    // fallback
    default: `// Start coding...\n`,
  };
  return templates[language] || templates.default;
};

// Helper to get language from file extension
export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    md: "markdown",
    txt: "plain",
  };
  return map[ext] || "javascript"; // default to javascript for new files without known extension
};