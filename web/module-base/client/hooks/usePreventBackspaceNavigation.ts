import { useEffect } from "react";

/**
 * Hook to prevent browser back navigation when pressing Backspace key.
 * Only prevents navigation when the user is NOT typing in an input field.
 * 
 * This is useful to prevent accidental navigation when users press Backspace
 * while not focused on an editable element.
 */
export function usePreventBackspaceNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Backspace key
      if (e.key !== "Backspace") {
        return;
      }

      // Get the currently focused element
      const target = e.target as HTMLElement;
      if (!target) {
        return;
      }

      // Check if the target is an editable element
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("contenteditable") === "true";

      // If not editable, prevent default behavior (browser back navigation)
      if (!isEditable) {
        // Also check if user is holding modifier keys (Ctrl, Alt, Meta)
        // In that case, allow default behavior for browser shortcuts
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
        }
      }
    };

    // Add event listener with capture phase to catch events early
    document.addEventListener("keydown", handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);
}

