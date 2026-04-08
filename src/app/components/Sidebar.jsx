import React, { Suspense } from "react";
import SidebarClient from "./SidebarClient";

export default function Sidebar(props) {
  // header height = 64px -> top-[64px], height = calc(100vh-64px)
  return (
    <aside className="w-full flex flex-col justify-start
                       sticky top-[64px] z-10 h-[calc(100vh-64px)]">

      <div className="h-full">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading menu…</div>}>
          <SidebarClient {...props} />
        </Suspense>
      </div>
    </aside>
  );
}