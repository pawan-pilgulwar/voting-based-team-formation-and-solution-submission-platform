"use client";

import { useState } from "react";
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

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  lastModified?: string;
}

interface FileTreeProps {
  teamId: string;
  problemId: string;
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode;
}

export const FileTree = ({ teamId, problemId, onFileSelect, selectedFile }: FileTreeProps) => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      path: "src",
      children: [
        { id: "2", name: "main.py", type: "file", path: "src/main.py", lastModified: "2 min ago" },
        { id: "3", name: "utils.py", type: "file", path: "src/utils.py", lastModified: "5 min ago" },
      ],
    },
    {
      id: "4",
      name: "tests",
      type: "folder",
      path: "tests",
      children: [
        { id: "5", name: "test_main.py", type: "file", path: "tests/test_main.py", lastModified: "10 min ago" },
      ],
    },
    { id: "6", name: "README.md", type: "file", path: "README.md", lastModified: "1 hour ago" },
  ]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "4"]));
  const [selectedFolder, setSelectedFolder] = useState<FileNode | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [dialogOpen, setDialogOpen] = useState(false);

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

    const newItem: FileNode = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      path: selectedFolder ? `${selectedFolder.path}/${newItemName}` : newItemName,
      children: newItemType === "folder" ? [] : undefined,
      lastModified: "just now",
    };

    const addItemToTree = (nodes: FileNode[]): FileNode[] => {
      if (!selectedFolder) {
        return [...nodes, newItem];
      }
      return nodes.map((node) => {
        if (node.id === selectedFolder.id) {
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
        <div className="flex gap-1">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewItemType("file")}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New {newItemType === "file" ? "File" : "Folder"}</DialogTitle>
                <DialogDescription>
                  {selectedFolder
                    ? `Create in: ${selectedFolder.path}`
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
