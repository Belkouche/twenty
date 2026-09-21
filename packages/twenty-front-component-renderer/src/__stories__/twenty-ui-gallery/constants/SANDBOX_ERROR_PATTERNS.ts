export const SANDBOX_ERROR_PATTERNS = {
  COMPOSED_PATH:
    "Uncaught TypeError: Cannot use 'in' operator to search for 'composedPath' in undefined",
  VIEWPORT_WIDTH:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'width')",
  NATIVE_EVENT_DEFAULT_PREVENTED:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'defaultPrevented')",
  POINTER_TYPE:
    "Uncaught TypeError: Cannot read properties of undefined (reading 'pointerType')",
  POINTER_EVENT_CONSTRUCTOR:
    /^Uncaught TypeError: .+\.PointerEvent is not a constructor$/,
};
