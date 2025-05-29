export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export class BinarySearchTree {
  root: TreeNode | null = null;

  insert(value: number): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode | null, value: number): TreeNode {
    if (node === null) {
      return { value, left: null, right: null };
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  search(value: number): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: TreeNode | null, value: number): boolean {
    if (node === null) {
      return false;
    }

    if (value === node.value) {
      return true;
    }

    if (value < node.value) {
      return this.searchNode(node.left, value);
    } else {
      return this.searchNode(node.right, value);
    }
  }

  // Get search path for visualization
  getSearchPath(value: number): number[] {
    const path: number[] = [];
    this.getSearchPathHelper(this.root, value, path);
    return path;
  }

  private getSearchPathHelper(node: TreeNode | null, value: number, path: number[]): boolean {
    if (node === null) {
      return false;
    }

    path.push(node.value);

    if (value === node.value) {
      return true;
    }

    if (value < node.value) {
      return this.getSearchPathHelper(node.left, value, path);
    } else {
      return this.getSearchPathHelper(node.right, value, path);
    }
  }

  // Build tree from array
  static fromArray(values: number[]): BinarySearchTree {
    const tree = new BinarySearchTree();
    values.forEach(value => tree.insert(value));
    return tree;
  }

  // Generate random tree
  static generateRandom(count: number, min: number = 1, max: number = 99): BinarySearchTree {
    const values = new Set<number>();
    
    while (values.size < count) {
      const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
      values.add(randomValue);
    }
    
    return BinarySearchTree.fromArray(Array.from(values));
  }

  // Get all nodes in order
  inOrder(): number[] {
    const result: number[] = [];
    this.inOrderHelper(this.root, result);
    return result;
  }

  private inOrderHelper(node: TreeNode | null, result: number[]): void {
    if (node !== null) {
      this.inOrderHelper(node.left, result);
      result.push(node.value);
      this.inOrderHelper(node.right, result);
    }
  }

  // Clear the tree
  clear(): void {
    this.root = null;
  }
}
