"use client";

import { useState } from "react";
import { FileTree } from "@/components/codeEditor/FileTree";
import { CodeEditor } from "@/components/codeEditor/CodeEditor";
import { OutputConsole } from "@/components/codeEditor/OutputConsole";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { toast } from "sonner";

interface EditorLayoutProps {
  teamId: string;
  problemId: string;
}

export const EditorLayout = ({ teamId, problemId }: EditorLayoutProps) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [output, setOutput] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [executionStatus, setExecutionStatus] = useState<"success" | "error" | "running" | "idle">("idle");

  const handleFileSelect = (file: any) => {
    setSelectedFile({
      ...file,
      content: "",
      language: getLanguageFromExtension(file.name),
    });
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
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
    };
    return languageMap[ext || ""] || "text";
  };

  const handleRunCode = async (code: string, language: string) => {
    setExecutionStatus("running");
    setOutput("Running code...\n");
    toast.info("Executing code...");

    // Simulate API call
    setTimeout(() => {
      const mockOutput = `> Executing ${language} code...\n\nHello World!\nSum: 15\n\n> Process finished with exit code 0`;
      setOutput(mockOutput);
      setExecutionTime("234ms");
      setExecutionStatus("success");
      toast.success("Code executed successfully!");
    }, 1500);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <FileTree
          teamId={teamId}
          problemId={problemId}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border" />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <CodeEditor
          teamId={teamId}
          problemId={problemId}
          onRun={handleRunCode}
          activeFile={selectedFile}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border" />
      
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <OutputConsole
          output={output}
          executionTime={executionTime}
          status={executionStatus}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
