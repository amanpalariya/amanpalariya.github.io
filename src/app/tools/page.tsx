"use client";

import { ToolsDirectoryPage } from "features/tools";
import ToolsShell from "./ToolsShell";

export default function ToolsPage() {
  return (
    <ToolsShell>
      <ToolsDirectoryPage />
    </ToolsShell>
  );
}
