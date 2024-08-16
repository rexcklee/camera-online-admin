import { ReactNode } from "react";
import { Sidebar } from "@/app/components/sidebar"; // Adjust the import based on your structure

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="basis-1/6 min-h-full " style={{ display: "flex" }}>
        <Sidebar />
      </div>
      <div className="basis-5/6 min-h-full p-6">{children}</div>
    </div>
  );
}
