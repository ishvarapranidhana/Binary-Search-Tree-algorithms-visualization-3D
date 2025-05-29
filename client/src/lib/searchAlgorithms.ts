import { TreeNode } from "./binarySearchTree";

export type SearchAlgorithm = "recursive" | "iterative" | "breadthFirst" | "depthFirst";

export interface SearchResult {
  found: boolean;
  path: number[];
  steps: number;
}

export class SearchAlgorithms {
  // Recursive search (standard BST search)
  static recursive(root: TreeNode | null, target: number): SearchResult {
    const path: number[] = [];
    let steps = 0;

    const search = (node: TreeNode | null): boolean => {
      steps++;
      if (node === null) {
        return false;
      }

      path.push(node.value);

      if (target === node.value) {
        return true;
      }

      if (target < node.value) {
        return search(node.left);
      } else {
        return search(node.right);
      }
    };

    const found = search(root);
    return { found, path, steps };
  }

  // Iterative search
  static iterative(root: TreeNode | null, target: number): SearchResult {
    const path: number[] = [];
    let steps = 0;
    let current = root;

    while (current !== null) {
      steps++;
      path.push(current.value);

      if (target === current.value) {
        return { found: true, path, steps };
      }

      if (target < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return { found: false, path, steps };
  }

  // Breadth-first search
  static breadthFirst(root: TreeNode | null, target: number): SearchResult {
    if (root === null) {
      return { found: false, path: [], steps: 0 };
    }

    const queue: TreeNode[] = [root];
    const path: number[] = [];
    let steps = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      steps++;
      path.push(current.value);

      if (current.value === target) {
        return { found: true, path, steps };
      }

      if (current.left) {
        queue.push(current.left);
      }
      if (current.right) {
        queue.push(current.right);
      }
    }

    return { found: false, path, steps };
  }

  // Depth-first search (pre-order)
  static depthFirst(root: TreeNode | null, target: number): SearchResult {
    const path: number[] = [];
    let steps = 0;

    const search = (node: TreeNode | null): boolean => {
      if (node === null) {
        return false;
      }

      steps++;
      path.push(node.value);

      if (node.value === target) {
        return true;
      }

      // Search left subtree, then right subtree
      return search(node.left) || search(node.right);
    };

    const found = search(root);
    return { found, path, steps };
  }

  // Execute search based on algorithm type
  static execute(
    algorithm: SearchAlgorithm,
    root: TreeNode | null,
    target: number
  ): SearchResult {
    switch (algorithm) {
      case "recursive":
        return this.recursive(root, target);
      case "iterative":
        return this.iterative(root, target);
      case "breadthFirst":
        return this.breadthFirst(root, target);
      case "depthFirst":
        return this.depthFirst(root, target);
      default:
        throw new Error(`Unknown search algorithm: ${algorithm}`);
    }
  }
}
