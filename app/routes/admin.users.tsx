import { Form, Link } from "react-router";
import type { Route } from "./+types/admin.users";
import { requireRole } from "~/lib/require-auth.server";
import { getAllUsers, updateUserRole } from "~/lib/db-admin.server";

export function meta() {
  return [{ title: "ユーザー管理 | 書き起こし.com" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin"]);
  const users = await getAllUsers(db);
  return { users };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  await requireRole(request, db, ["admin"]);

  const form = await request.formData();
  const userId = form.get("user_id") as string;
  const role = form.get("role") as string;

  if (userId && role && ["member", "editor", "admin"].includes(role)) {
    await updateUserRole(db, userId, role);
  }

  return { ok: true };
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  admin: { label: "管理者", className: "bg-purple-100 text-purple-700" },
  editor: { label: "編集者", className: "bg-blue-100 text-blue-700" },
  member: { label: "メンバー", className: "bg-gray-100 text-gray-600" },
};

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-sm text-gray-500 no-underline hover:text-gray-700">
          ← 管理画面
        </Link>
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
      </div>

      <div className="border rounded-lg divide-y">
        {users.map((user) => {
          const role = ROLE_LABELS[user.role] || ROLE_LABELS.member;
          return (
            <div key={user.id} className="flex items-center gap-4 px-4 py-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {user.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email || "メールなし"}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${role.className}`}>
                {role.label}
              </span>
              <Form method="post" className="flex items-center gap-2">
                <input type="hidden" name="user_id" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="member">メンバー</option>
                  <option value="editor">編集者</option>
                  <option value="admin">管理者</option>
                </select>
                <button
                  type="submit"
                  className="text-xs px-2 py-1 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  変更
                </button>
              </Form>
            </div>
          );
        })}
        {users.length === 0 && (
          <p className="text-gray-400 py-8 text-center">ユーザーがいません。</p>
        )}
      </div>
    </div>
  );
}
