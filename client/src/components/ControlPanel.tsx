import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useBST } from "../lib/stores/useBST";
import { SearchAlgorithm } from "../lib/searchAlgorithms";

export default function ControlPanel() {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [algorithm, setAlgorithm] = useState<SearchAlgorithm>("recursive");
  
  const { 
    tree, 
    buildTreeFromArray, 
    search, 
    clear, 
    isSearching,
    searchPath,
    generateRandomTree 
  } = useBST();

  const handleBuildTree = () => {
    if (!inputValue.trim()) return;
    
    try {
      // Parse comma-separated values
      const values = inputValue
        .split(',')
        .map(v => parseInt(v.trim()))
        .filter(v => !isNaN(v) && v >= 1 && v <= 99);
      
      if (values.length === 0) {
        alert("Please enter valid numbers between 01 and 99");
        return;
      }
      
      buildTreeFromArray(values);
      setInputValue("");
    } catch (error) {
      alert("Please enter valid comma-separated numbers");
    }
  };

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value) || value < 1 || value > 99) {
      alert("Please enter a valid number between 01 and 99");
      return;
    }
    
    search(value, algorithm);
  };

  const handleGenerateRandom = () => {
    generateRandomTree(22);
  };

  const getTreeStats = () => {
    if (!tree) return null;
    
    const getHeight = (node: any): number => {
      if (!node) return 0;
      return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };
    
    const getNodeCount = (node: any): number => {
      if (!node) return 0;
      return 1 + getNodeCount(node.left) + getNodeCount(node.right);
    };
    
    return {
      height: getHeight(tree),
      nodeCount: getNodeCount(tree)
    };
  };

  const stats = getTreeStats();

  return (
    <div className="absolute top-4 left-4 w-80 z-10">
      <Card className="bg-black/80 border-gray-700 text-white backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-400 text-lg">
            3D Binary Search Tree Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tree Construction */}
          <div className="space-y-2">
            <Label htmlFor="tree-input" className="text-sm font-medium">
              Build Tree (comma-separated values 01-99)
            </Label>
            <div className="flex gap-2">
              <Input
                id="tree-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., 50, 30, 70, 20, 40"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <Button 
                onClick={handleBuildTree}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Build
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateRandom}
              size="sm"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Random Tree
            </Button>
            <Button 
              onClick={clear}
              size="sm"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>

          <Separator className="bg-gray-600" />

          {/* Search Controls */}
          <div className="space-y-2">
            <Label htmlFor="algorithm-select" className="text-sm font-medium">
              Search Algorithm
            </Label>
            <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as SearchAlgorithm)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="recursive" className="text-white hover:bg-gray-700">
                  Recursive Search
                </SelectItem>
                <SelectItem value="iterative" className="text-white hover:bg-gray-700">
                  Iterative Search
                </SelectItem>
                <SelectItem value="breadthFirst" className="text-white hover:bg-gray-700">
                  Breadth-First Search
                </SelectItem>
                <SelectItem value="depthFirst" className="text-white hover:bg-gray-700">
                  Depth-First Search
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-input" className="text-sm font-medium">
              Search Value
            </Label>
            <div className="flex gap-2">
              <Input
                id="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter number to search"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={!tree || isSearching}
              />
              <Button 
                onClick={handleSearch}
                size="sm"
                disabled={!tree || isSearching}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Tree Statistics */}
          {stats && (
            <>
              <Separator className="bg-gray-600" />
              <div className="space-y-1 text-sm">
                <div className="text-gray-300">
                  <span className="text-green-400">Nodes:</span> {stats.nodeCount}
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">Height:</span> {stats.height}
                </div>
                {searchPath.length > 0 && (
                  <div className="text-gray-300">
                    <span className="text-orange-400">Search Path:</span> {searchPath.join(' → ')}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status */}
          {isSearching && (
            <div className="text-orange-400 text-sm font-medium animate-pulse">
              Searching...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
