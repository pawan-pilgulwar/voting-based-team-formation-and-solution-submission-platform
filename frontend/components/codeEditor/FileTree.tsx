"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Upload, Trash2, FileText } from "lucide-react";
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
import { getTeamCodeFiles } from "@/lib/api";

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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeamCodeFiles(teamId);
        const nodes = buildTreeFromPaths(
          (data || []).map((f: any) => ({
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
        toast.info("Loaded sample files. Connect code files API for full sync.");
      }
    };
    load();
  }, [teamId]);

  const normalizePath = (path: string, filename: string) => {
  if (!path || path === "." || path === "/") return filename;

  // If backend mistakenly sent full path including filename
  if (path.endsWith(filename)) return path;

  return `${path.replace(/\/+$/g, "")}/${filename}`;
};


  const buildTreeFromPaths = (items: Array<{ path: string; lastModified?: string; content?: string; language?: string }>): FileNode[] => {
    const makeId = (fullPath: string) => fullPath.replace(/[\/\.]/g, "-");

    const root: Record<string, any> = {};
    items.forEach((it, idx) => {
      const segments = it.path.split("/").filter(Boolean);
      let cur = root;
      let curPath = "";
      segments.forEach((seg, i) => {
        curPath = curPath ? `${curPath}/${seg}` : seg;
        const isLeaf = i === segments.length - 1;
        if (!cur[seg]) {
          cur[seg] = {
            __node: {
              id: makeId(curPath),
              name: seg,
              type: isLeaf ? "file" : "folder",
              path: curPath,
              lastModified: isLeaf ? (it.lastModified || undefined) : undefined,
              content: isLeaf ? (it as any).content : undefined,
              language: isLeaf ? (it as any).language : undefined,
              children: isLeaf ? undefined : [],
            },
          };
        }
        cur = cur[seg];
      });
    });
    const toArray = (obj: any): FileNode[] => {
      const data : FileNode[] = Object.values(obj)
        .filter((v: any) => v && v.__node)
        .map((v: any) => {
          const node: FileNode = v.__node;
          console.log(node);
          if (node.type === "folder") {
            node.children = toArray(v);
          }
          return node;
        }); 
      // SORT: folders first, files second (alphabetical inside each group)
      data.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        return a.name.localeCompare(b.name);            // alphabetical sort
      });
      return data;
    };
    return toArray(root);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const basePath = targetPath || "";

    const newItem: FileNode = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      path: basePath ? `${basePath}/${newItemName}` : newItemName,
      children: newItemType === "folder" ? [] : undefined,
      lastModified: "just now",
    };

    const addItemToTree = (nodes: FileNode[]): FileNode[] => {
      if (!basePath) {
        return [...nodes, newItem];
      }
      return nodes.map((node) => {
        if (node.type === "folder" && node.path === basePath) {
          return {
            ...node,
            children: [...(node.children || []), newItem],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addItemToTree(node.children),
          };
        }
        return node;
      });
    };

    setFiles(addItemToTree(files));
    setDialogOpen(false);
    setNewItemName("");
    toast.success(`${newItemType === "file" ? "File" : "Folder"} created successfully`);
  };

  const handleDelete = (nodeToDelete: FileNode) => {
    const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter((node) => {
        if (node.id === nodeToDelete.id) {
          return false;
        }
        if (node.children) {
          node.children = deleteFromTree(node.children);
        }
        return true;
      });
    };

    setFiles(deleteFromTree(files));
    toast.success(`${nodeToDelete.type === "file" ? "File" : "Folder"} deleted successfully`);
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
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                <FolderOpen className="h-4 w-4 text-accent flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-accent flex-shrink-0" />
              )
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm truncate text-foreground">{node.name}</span>
          </div>

          {!readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(node);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

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
                <Button onClick={handleCreateItem}>Create</Button>
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
