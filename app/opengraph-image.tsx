import { META } from "@/lib/copy";
import { OG_SIZE, renderOg } from "@/lib/server/og";

export const runtime = "nodejs";
export const alt = META.ogTitle;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOg("br");
}
