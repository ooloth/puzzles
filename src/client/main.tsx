import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";

const root = document.getElementById("root");
// TODO: untested until view code has a test runner (docs/questions/what-runs-the-tests.md).
if (root === null) {
  throw new Error("index.html has no #root element");
}
createRoot(root).render(<App />);
