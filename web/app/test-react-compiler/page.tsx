import { Card, CardBody, CardHeader } from "@heroui/card";
import TestComponent from "./TestComponent";

export default function TestReactCompilerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <h1 className="text-2xl font-bold">React Compiler Test & Refactor Guide</h1>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              This page tests React Compiler functionality and documents refactoring patterns.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Refactoring Patterns:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li><strong>Remove useMemo</strong> for simple computed values from props/state</li>
                <li><strong>Remove useCallback</strong> for event handlers (unless used as dependency)</li>
                <li><strong>Keep useMemo/useCallback</strong> if they are dependencies of other hooks</li>
                <li><strong>Review Context values</strong> - may need to keep for stability</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Note:</h3>
              <p className="text-sm text-yellow-800">
                React Compiler automatically optimizes components. Manual memoization is no longer needed
                for performance optimization, but may still be needed for logic requirements.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <TestComponent />
    </div>
  );
}

