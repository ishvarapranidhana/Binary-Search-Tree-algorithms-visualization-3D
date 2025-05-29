import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BinarySearchTree, TreeNode } from "../binarySearchTree";
import { SearchAlgorithms, SearchAlgorithm, SearchResult } from "../searchAlgorithms";

interface BSTState {
  tree: TreeNode | null;
  searchPath: number[];
  isSearching: boolean;
  lastSearchResult: SearchResult | null;
  
  // Actions
  buildTreeFromArray: (values: number[]) => void;
  generateRandomTree: (count: number) => void;
  search: (value: number, algorithm: SearchAlgorithm) => Promise<void>;
  clear: () => void;
  resetSearch: () => void;
}

export const useBST = create<BSTState>()(
  subscribeWithSelector((set, get) => ({
    tree: null,
    searchPath: [],
    isSearching: false,
    lastSearchResult: null,

    buildTreeFromArray: (values: number[]) => {
      const bst = BinarySearchTree.fromArray(values);
      set({
        tree: bst.root,
        searchPath: [],
        lastSearchResult: null,
      });
    },

    generateRandomTree: (count: number) => {
      const bst = BinarySearchTree.generateRandom(count, 1, 99);
      set({
        tree: bst.root,
        searchPath: [],
        lastSearchResult: null,
      });
    },

    search: async (value: number, algorithm: SearchAlgorithm) => {
      const { tree } = get();
      if (!tree) return;

      set({ isSearching: true, searchPath: [] });

      // Execute search
      const result = SearchAlgorithms.execute(algorithm, tree, value);

      // Animate the search path
      for (let i = 0; i < result.path.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay between steps
        set(state => ({
          searchPath: result.path.slice(0, i + 1)
        }));
      }

      // Finish search
      set({
        isSearching: false,
        lastSearchResult: result,
      });

      // Clear search path after a delay
      setTimeout(() => {
        set({ searchPath: [] });
      }, 3000);
    },

    clear: () => {
      set({
        tree: null,
        searchPath: [],
        isSearching: false,
        lastSearchResult: null,
      });
    },

    resetSearch: () => {
      set({
        searchPath: [],
        isSearching: false,
        lastSearchResult: null,
      });
    },
  }))
);

// Initialize with a random tree on app start
setTimeout(() => {
  useBST.getState().generateRandomTree(22);
}, 100);
