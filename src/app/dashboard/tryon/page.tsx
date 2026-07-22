import { redirect } from "next/navigation";

export default function TryOnOverviewRedirect() {
  redirect("/dashboard/tryon/jobs");
}
