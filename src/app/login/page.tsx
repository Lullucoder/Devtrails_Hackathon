import { redirect } from "next/navigation";

export default function LoginPage() {
  // Keep /login as a compatibility alias and route users to the landing modal.
  redirect("/?login=1");
}
