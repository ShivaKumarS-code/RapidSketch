export interface FileNode {
  name: string;
  content: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}
