"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Play, Clock, X, Send } from "lucide-react";
import { toast } from "sonner";
import { saveCode, submitSolution } from "@/lib/api";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

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
  readOnly?: boolean;
}

export const CodeEditor = ({ teamId, problemId, onRun, activeFile, readOnly = false }: CodeEditorProps) => {
  const [openFiles, setOpenFiles] = useState<EditorFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [code, setCode] = useState("");
  const { user } = useAuth();

  // ====== SOCKET.IO STATE (NEW) ======
  const socketRef = useRef<Socket | null>(null);
  const activeTabRef = useRef<string>("");

  // keep ref in sync with state for use inside socket handlers
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!teamId) return;

    const namespace = `${process.env.NEXT_PUBLIC_BACKEND_URL}/team/${teamId}`;
    const socket = io(namespace, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

     socket.on("connect", () => {
      // console.log("Code editor socket connected", socket.id);
    });

    
    // Listen for remote code changes
    socket.on("code:change", (payload: any) => {
      const { fileId, content } = payload || {};
      if (!fileId) return;

      setOpenFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === fileId ? { ...f, content: content ?? "" } : f
        );

        // If this is the currently active file, update editor content too
        if (fileId === activeTabRef.current) {
          setCode(content ?? "");
        }

        return updated;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };

  }, [teamId]);

  // Join / leave file rooms when active tab changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!activeTab) return;

    // Join this file room
    socket.emit("code:joinFile", { fileId: activeTab });

    // On change of activeTab or unmount, leave the previous file room
    return () => {
      socket.emit("code:leaveFile", { fileId: activeTab });
    };
  }, [activeTab]);



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
    if (readOnly) return;
    const currentFile = openFiles.find((f) => f.id === activeTab);
    if (!currentFile) return;

    // Update the file content
    setOpenFiles(
      openFiles.map((f) =>
        f.id === activeTab ? { ...f, content: code, lastModified: "just now" } : f
      )
    );

    try {
      const fullPath = currentFile.path || currentFile.name;
      const lastSlashIndex = fullPath.lastIndexOf("/");
      let parentPath = lastSlashIndex > -1 ? fullPath.slice(0, lastSlashIndex) : ".";

      if (parentPath === "." || parentPath === "/") parentPath = "";

      await saveCode({
        teamId,
        filename: currentFile.name,
        language: currentFile.language,
        content: code,
        path: parentPath,
        type: "file",
      });
      toast.success(`Saved ${currentFile.name}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Save failed");
    }
  };

  const handleRun = () => {
    const currentFile = openFiles.find((f) => f.id === activeTab);
    if (!currentFile) {
      toast.error("No file selected");
      return;
    }
    onRun(code, currentFile.language);
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    const currentFile = openFiles.find((f) => f.id === activeTab);
    if (!currentFile) {
      toast.error("No file selected");
      return;
    }
    try {
      await submitSolution({
        teamId,
        problemId,
        code: code,
        filename: currentFile.name,
        language: currentFile.language,
      });
      toast.success("Solution submitted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Submit failed");
    }
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
      <div className="flex items-center justify-between p-2.5 border-b border-panel-border bg-panel-bg">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="default" size="sm" className="h-8" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
              <Button variant="default" size="sm" className="h-8 bg-primary/90 hover:bg-primary/80" onClick={handleRun}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Run
              </Button>
              <Button variant="default" size="sm" className="h-8 bg-primary/90 hover:bg-primary/80" onClick={handleSubmit}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit
              </Button>
            </>
          )}
          {readOnly && (
            <Button variant="default" size="sm" className="h-8 bg-primary/90 hover:bg-primary/80" onClick={handleRun}>
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Run
            </Button>
          )}
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
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(file.id);
                  }}
                  className="ml-2 hover:bg-panel-hover rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {openFiles.map((file) => (
            <TabsContent key={file.id} value={file.id} className="flex-1 m-0 p-0">
              <div className="h-full flex flex-col">
                <Editor
                  height="70vh"
                  defaultLanguage={file?.language || "javascript"}
                  value={file?.content || ""}
                  onChange={(value: string | undefined) => {
                    setCode(value || "");
                    setOpenFiles(
                      openFiles.map((f) =>
                        f.id === activeTab ? { ...f, content: value || "" } : f
                      )
                    );
                    socketRef.current?.emit("code:change", {
                      fileId: activeTabRef.current,
                      teamId: teamId,
                      content: value,
                      userId: user?._id,
                      username: user?.name,
                    });
                  }}
                  theme="vs-dark"
                  options={{ readOnly }}
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
