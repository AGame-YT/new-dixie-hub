import type { Metadata } from "next";
import "./dev.css";
import { DevShowcase } from "./DevShowcase";

export const metadata: Metadata = {
  title: "Dev preview",
  description:
    "Experimental Dixie Hub interface for previewing new features and layout ideas."
};

// Time-based widgets render on the client, so keep this route dynamic.
export const dynamic = "force-dynamic";

export default function DevPage() {
  return <DevShowcase />;
}
