import { currentUser, publicUser } from "../../../../lib/auth";
export async function GET() { try { const user = await currentUser(); return user ? Response.json({ user: publicUser(user) }) : Response.json({ error: "Not logged in" }, { status: 401 }); } catch { return Response.json({ error: "Not logged in" }, { status: 401 }); } }
