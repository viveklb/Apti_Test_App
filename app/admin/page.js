import { notFound } from "next/navigation";
import { currentUser, isAdmin } from "../../lib/auth";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!isAdmin(user)) notFound();
  return <AdminPanel name={user.name} />;
}
