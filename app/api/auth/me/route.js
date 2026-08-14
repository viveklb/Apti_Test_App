import { currentUser } from "../../../../lib/auth";
export async function GET() { try { const user = await currentUser(); return user ? Response.json({ user: { id: user._id, name: user.name, email: user.email } }) : Response.json({ error: "Not logged in" }, { status: 401 }); } catch { return Response.json({ error: "Not logged in" }, { status: 401 }); } }
