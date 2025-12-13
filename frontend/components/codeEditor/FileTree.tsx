"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Upload, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getTeamCodeFiles, saveCode, deleteCodeFileApi, renameCodeFileApi } from "@/lib/api";
import { io, Socket } from "socket.io-client";


interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  lastModified?: string;
  content?: string;
  language?: string;
}

interface FileTreeProps {
  teamId: string;
  problemId: string;
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode;
  readOnly?: boolean;
}

export const FileTree = ({ teamId, problemId, onFileSelect, selectedFile, readOnly = false }: FileTreeProps) => {
  const [files, setFiles] = useState<FileNode[]>([]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "4"]));
  const [selectedFolder, setSelectedFolder] = useState<FileNode | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetPath, setTargetPath] = useState<string>("");

  // ====== SOCKET.IO STATE (NEW) ======
    const socketRef = useRef<Socket | null>(null);

  // Normalize path returned from backend
  const normalizePath = (path: string, filename: string) => {
    if (!path || path === "." || path === "/") return filename;
    if (path.endsWith(filename)) return path;
    return `${path.replace(/\/+$/g, "")}/${filename}`;
  };

  // Build folder tree from flat paths
  const buildTreeFromPaths = (
    items: Array<{
      path: string;
      lastModified?: string;
      content?: string;
      language?: string;
      _id: string;
      filename?: string;
      type?: "file" | "folder";
    }>
  ): FileNode[] => {

    const root: Record<string, any> = {};

    items.forEach((it) => {
      const segments = it.path.split("/").filter(Boolean);
      let cur = root;
      let curPath = "";
      segments.forEach((seg, i) => {
        curPath = curPath ? `${curPath}/${seg}` : seg;
        const isLeaf = i === segments.length - 1;

        if (!cur[seg]) {
          // For leaf nodes prefer the original item's type (file/folder) when available
          const nodeType = isLeaf ? (it.type || "file") : "folder";
          const nodeId = nodeType === "file" ? it._id : `folder:${curPath}`;

          cur[seg] = {
            __node: {
              id: nodeId,
              name: seg,
              type: nodeType,
              path: curPath,
              lastModified: nodeType === "file" ? it.lastModified : undefined,
              content: nodeType === "file" ? it.content : undefined,
              language: nodeType === "file" ? it.language : undefined,
              children: nodeType === "folder" ? [] : undefined,
            },
          };
        }

        cur = cur[seg];
      });
    });

    const toArray = (obj: any): FileNode[] =>
      Object.values(obj)
        .filter((v: any) => v.__node)
        .map((v: any) => {
          const node: FileNode = v.__node;
          if (node.type === "folder") {
            node.children = toArray(v);
          }
          return node;
        })
        .sort((a, b) => {
          if (a.type === "folder" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "folder") return 1;
          return a.name.localeCompare(b.name);
        });

    return toArray(root);
  };

  // Function to refresh file tree from backend
  const refreshFiles = async () => {
    try {
      const data = await getTeamCodeFiles(teamId);
      const nodes = buildTreeFromPaths(
        data.map((f: any) => ({
          _id: f._id,
          filename: f.filename,
          type: f.type,
          path: normalizePath(f.path, f.filename),
          lastModified: f.updatedAt,
          content: f.content,
          language: f.language,
        }))
      );
      setFiles(nodes);
    } catch (err) {
      console.error("Failed to refresh tree:", err);
    }
  };

  // Initial file load
  useEffect(() => {
    refreshFiles();
  }, [teamId]);

  //-------------------------------
  // SOCKET.IO SETUP
  //-------------------------------

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!teamId) return;

    const namespace = `${process.env.NEXT_PUBLIC_BACKEND_URL}/team/${teamId}`;
    const socket = io(namespace, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", teamId);
      socket.emit("directory:join"); // join team-level directory room
    });

    socket.on("directory:update", () => {
      console.log("Directory received update");
      refreshFiles(); // auto refresh UI
    });

     return () => {
      socket.emit("directory:leave");
      socket.disconnect();
    };
  }, [teamId]);

  // ====== END SOCKET.IO STATE ======
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeamCodeFiles(teamId);
        const nodes = buildTreeFromPaths(
          (data || []).map((f: any) => ({
            _id: f._id,
            filename: f.filename,
            type: f.type,
            path: normalizePath(f.path, f.filename),
            lastModified: f.updatedAt,
            content: f.content,
            language: f.language,
          }))
        );
        console.log(nodes)
        setFiles(nodes);
      } catch (e) {
        // Fallback to a minimal starter structure
        setFiles([
          { id: "1", name: "src", type: "folder", path: "src", children: [
            { id: "2", name: "main.py", type: "file", path: "src/main.py", lastModified: "just now" },
          ]},
          { id: "3", name: "README.md", type: "file", path: "README.md", lastModified: "just now" },
        ]);
        console.log(e);
        toast.info("Loaded sample files. Connect code files API for full sync.");
      }
    };
    load();
  }, [teamId]);

  //-------------------------------
  // CREATE FILE / FOLDER
  //-------------------------------
  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const isFile = newItemType === "file";
  
    // root folder fix
    let basePath = targetPath || "";
    if (basePath === "." || basePath === "/") {
      basePath = ".";
    }

    try {
      await saveCode({
        teamId,
        filename: newItemName,
        type: newItemType,
        path: basePath,
        language: isFile ? "plain" : undefined,
        content: isFile ? "" : undefined,
      });

      toast.success(`${newItemType} created`);
      refreshFiles();
      setDialogOpen(false);
      setNewItemName("");
    } catch (err) {
      console.log(err);
      toast.error("Error creating item");
      return;
    }
  };

  //-------------------------------
  // DELETE FILE / FOLDER
  //-------------------------------
  const handleDelete = async (node: FileNode) => {
    try {
      await deleteCodeFileApi(node.id);
      toast.success("Deleted");
      refreshFiles();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  //-------------------------------
  // RENAME FILE
  //-------------------------------
  const handleRename = async (node: FileNode, newName: string) => {
    try {
      await renameCodeFileApi(node.id, { newFilename: newName });
      toast.success("Renamed");
      refreshFiles();
    } catch (err) {
      console.log(err);
      toast.error("Rename failed");
    }
  };

  //-------------------------------
  // RENDER NODE
  //-------------------------------
  const toggleExpanded = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const handleUpload = (folder: FileNode | null) => {
    toast.success("Upload functionality ready - connect to backend API");
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedFile?.id === node.id;
    const isFolder = node.type === "folder";

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
            isSelected ? "bg-panel-hover" : "hover:bg-panel-hover/50"
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {isFolder && (
            <button onClick={() => toggleExpanded(node.id)} className="p-0 hover:bg-transparent">
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          )}
          
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => {
              if (isFolder) {
                setSelectedFolder(node);
                setTargetPath(node.path);
                toggleExpanded(node.id);
              } else {
                onFileSelect(node);
              }
            }}
          >
            {isFolder ? (
              isExpanded ? (
                <FolderOpen size={16} />
              ) : (
                <Folder size={16} />
              )
            ) : (
              <FileText size={16} />
            )}
            <span className="text-sm truncate text-foreground">{node.name}</span>
          </div>

          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              // className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(node);
              }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  //-------------------------------
  // UI
  //-------------------------------
  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Files</h2>
        {!readOnly && (
        <div className="flex gap-1">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setNewItemType("file");
                  setTargetPath(selectedFolder?.path || "");
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New {newItemType === "file" ? "File" : "Folder"}</DialogTitle>
                <DialogDescription>
                  {targetPath
                    ? `Create in: ${targetPath}`
                    : "Create in root directory"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as "file" | "folder")}
                  >
                    <option value="file">File</option>
                    <option value="folder">Folder</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <select
                    id="location"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                  >
                    <option value="">Root directory</option>
                    {(() => {
                      const folders: FileNode[] = [];
                      const collect = (nodes: FileNode[]) => {
                        nodes.forEach((n) => {
                          if (n.type === "folder") {
                            folders.push(n);
                            if (n.children && n.children.length) {
                              collect(n.children);
                            }
                          }
                        });
                      };
                      collect(files);
                      return folders.map((folder) => (
                        <option key={folder.id} value={folder.path}>
                          {folder.path}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={newItemType === "file" ? "main.py" : "my-folder"}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                onClick={() => {
                  handleCreateItem();
                }}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleUpload(selectedFolder)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {files.map((node) => renderNode(node))}
      </div>

      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        Team: {teamId} | Problem: {problemId}
      </div>

    </div>
  );
};
