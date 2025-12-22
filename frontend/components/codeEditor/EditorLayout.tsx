"use client";

import { useState } from "react";
import { FileTree } from "@/components/codeEditor/FileTree";
import { CodeEditor } from "@/components/codeEditor/CodeEditor";
import { OutputConsole } from "@/components/codeEditor/OutputConsole";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { toast } from "sonner";
import { runCode } from "@/lib/api";
import { getLanguageFromFilename } from "@/lib/CodingLanguageUtils";

interface EditorLayoutProps {
  teamId: string;
  problemId: string;
  readOnly?: boolean;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

export const EditorLayout = ({ teamId, problemId, readOnly = false }: EditorLayoutProps) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [output, setOutput] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [executionStatus, setExecutionStatus] = useState<"success" | "error" | "running" | "idle">("idle");
  const [loading, setLoading] = useState(false);
  const [stdin, setStdin] = useState("");

  const handleFileSelect = (file: any) => {
    setSelectedFile({
      ...file,
      content: file.content ?? "",
      language: file.language || getLanguageFromFilename(file.name),
    });
  };


  const handleRunCode = async (code: string, language: string) => {
    setLoading(true);
    setExecutionStatus("running");
    setOutput("Running code...\n");
    toast.info("Executing code...");

  // Validate language id and source code
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    toast.error(`Unsupported language: ${language}`);
    console.log(`Unsupported language: ${language}`);
    setExecutionStatus("error");
    setLoading(false);
    return;
  }

  if (!code || !code.trim()) {
    toast.error("Source code is empty");
    console.log("Source code is empty");
    setExecutionStatus("error");
    setLoading(false);
    return;
  }

    try {
      const data = await runCode(languageId, code, stdin);
      console.log(data);
      if (data.status && data.status.id >= 3) {
        setOutput(data.stdout || data.stderr || data.compile_output || "Program finished with no output.");
        if (data.time) {
          setExecutionTime(`${data.time}s`);
        }
        setExecutionStatus("success");
        setLoading(false);
        toast.success("Code executed successfully!");
      } else {
        setOutput("⏳ Processing your code...");
        setExecutionStatus("running");
        setTimeout(() => handleRunCode(code, language), 1000);
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Failed to run code");
      setExecutionStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <FileTree
          teamId={teamId}
          problemId={problemId}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          readOnly={readOnly}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border" />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <CodeEditor
          teamId={teamId}
          problemId={problemId}
          onRun={handleRunCode}
          activeFile={selectedFile}
          readOnly={readOnly}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border" />
      
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <OutputConsole
          output={output}
          executionTime={executionTime}
          status={executionStatus}
          input={stdin}
          onInputChange={setStdin}
          onClear={() => {
            setOutput("");
            setExecutionTime("");
            setExecutionStatus("idle");
          }}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
