import { useEffect, useState } from "react";
import { loadHello, type HelloOutcome } from "./hello.ts";

type HelloView = { readonly kind: "waiting" } | { readonly kind: "settled"; readonly outcome: HelloOutcome };

export function App() {
  const [view, setView] = useState<HelloView>({ kind: "waiting" });

  useEffect(() => {
    const request = new AbortController();
    void loadHello(request.signal).then((outcome) => {
      // An abort means the view is gone, so there is nothing to show and nothing went wrong.
      if (request.signal.aborted) return;
      if (outcome.kind !== "answered") console.error("the greeting could not be shown", outcome);
      setView({ kind: "settled", outcome });
    });
    return () => request.abort();
  }, []);

  if (view.kind === "waiting") return null;
  const { outcome } = view;
  switch (outcome.kind) {
    case "answered":
      return <p>{outcome.text}</p>;
    // What the page shows before an answer, and when there is none, is deferred to M9 and M2 in
    // docs/questions/README.md, so it shows nothing.
    case "error-status":
    case "not-plain-text":
    case "unreachable":
      return null;
    default: {
      const unreachable: never = outcome;
      return unreachable;
    }
  }
}
