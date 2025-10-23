"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Play, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  lastModified?: string;
}

interface CodeEditorProps {
  teamId: string;
  problemId: string;
  onRun: (code: string, language: string) => void;
  activeFile?: EditorFile;
}

export const CodeEditor = ({ teamId, problemId, onRun, activeFile }: CodeEditorProps) => {
  const [openFiles, setOpenFiles] = useState<EditorFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (activeFile && !openFiles.find((f) => f.id === activeFile.id)) {
      const newFile: EditorFile = {
        ...activeFile,
        content: activeFile.content || getDefaultContent(activeFile.language),
      };
      setOpenFiles([...openFiles, newFile]);
      setActiveTab(newFile.id);
      setCode(newFile.content);
    } else if (activeFile) {
      setActiveTab(activeFile.id);
      const file = openFiles.find((f) => f.id === activeFile.id);
      if (file) setCode(file.content);
    }
  }, [activeFile]);

  const getDefaultContent = (language: string): string => {
    const templates: Record<string, string> = {
      python: '# Python Solution\n\ndef solve():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    solve()',
      javascript: '// JavaScript Solution\n\nfunction solve() {\n    // Your code here\n}\n\nsolve();',
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
    };
    return templates[language] || '// Start coding...';
  };

  const handleSave = async () => {
    const currentFile = openFiles.find((f) => f.id === activeTab);
    if (!currentFile) return;

    // Update the file content
    setOpenFiles(
      openFiles.map((f) =>
        f.id === activeTab ? { ...f, content: code, lastModified: "just now" } : f
      )
    );

    toast.success(`Saved ${currentFile.name}`);
  };

  const handleRun = () => {
    const currentFile = openFiles.find((f) => f.id === activeTab);
    if (!currentFile) {
      toast.error("No file selected");
      return;
    }
    onRun(code, currentFile.language);
  };

  const handleCloseTab = (fileId: string) => {
    const newOpenFiles = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (activeTab === fileId && newOpenFiles.length > 0) {
      setActiveTab(newOpenFiles[0].id);
      setCode(newOpenFiles[0].content);
    } else if (newOpenFiles.length === 0) {
      setActiveTab("");
      setCode("");
    }
  };

  const currentFile = openFiles.find((f) => f.id === activeTab);

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      <div className="flex items-center justify-between p-2 border-b border-panel-border bg-panel-bg">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="h-8" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
          <Button variant="default" size="sm" className="h-8 bg-status-success hover:bg-status-success/90" onClick={handleRun}>
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run
          </Button>
        </div>
        {currentFile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{currentFile.lastModified || "Not saved"}</span>
          </div>
        )}
      </div>

      {openFiles.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-panel-bg border-b border-panel-border rounded-none h-10 justify-start p-0">
            {openFiles.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="relative rounded-none border-r border-panel-border data-[state=active]:bg-editor-bg px-4 py-2"
              >
                <span className="text-xs">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(file.id);
                  }}
                  className="ml-2 hover:bg-panel-hover rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </TabsTrigger>
            ))}
          </TabsList>

          {openFiles.map((file) => (
            <TabsContent key={file.id} value={file.id} className="flex-1 m-0 p-0">
              <div className="h-full flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setOpenFiles(
                      openFiles.map((f) =>
                        f.id === activeTab ? { ...f, content: e.target.value } : f
                      )
                    );
                  }}
                  className="flex-1 w-full p-4 bg-editor-bg text-foreground font-mono text-sm resize-none outline-none"
                  placeholder="Start coding..."
                  spellCheck={false}
                  style={{
                    lineHeight: "1.6",
                    tabSize: 4,
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-sm mb-2">No file open</p>
            <p className="text-xs">Select a file from the tree to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
};
