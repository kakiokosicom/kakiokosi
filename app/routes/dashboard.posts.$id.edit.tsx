import { Form, Link, useFetcher } from "react-router";
import {
  useRef,
  useCallback,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";
import type { Route } from "./+types/dashboard.posts.$id.edit";
import { requireAuth } from "~/lib/require-auth.server";
import {
  getPostForEdit,
  getPostForEditAdmin,
  updatePost,
  publishPost,
  deletePost,
  submitForReview,
  managePostCategories,
} from "~/lib/db-dashboard.server";
import { getAllCategories } from "~/lib/db.server";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data?.post?.title || "編集"} | 書き起こし.com` },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const postId = parseInt(params.id, 10);

  let post;
  if (user.role === "admin" || user.role === "editor") {
    post = await getPostForEditAdmin(db, postId);
  } else {
    post = await getPostForEdit(db, postId, user.id);
  }

  if (!post) {
    throw new Response("投稿が見つかりません", { status: 404 });
  }

  const categories = await getAllCategories(db);
  return { post, categories, user };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const { user } = await requireAuth(request, db);
  const postId = parseInt(params.id, 10);
  const form = await request.formData();
  const intent = form.get("_intent") as string;

  if (intent === "save") {
    await updatePost(db, postId, user.id, {
      title: form.get("title") as string,
      content: form.get("content") as string,
      excerpt: form.get("excerpt") as string,
      primary_category: form.get("primary_category") as string,
    });
    const pc = form.get("primary_category") as string;
    if (pc) await managePostCategories(db, postId, [pc]);
    return { saved: true };
  }

  if (intent === "submit") {
    await submitForReview(db, postId, user.id);
    return { submitted: true };
  }

  if (intent === "publish") {
    if (user.role !== "admin" && user.role !== "editor")
      return { error: "公開権限がありません" };
    await publishPost(db, postId);
    const post = await getPostForEditAdmin(db, postId);
    if (post)
      return Response.redirect(
        `${new URL(request.url).origin}/share/${post.primary_category}/${post.id}`,
        302
      );
    return { published: true };
  }

  if (intent === "delete") {
    await deletePost(db, postId, user.id);
    return Response.redirect(
      `${new URL(request.url).origin}/dashboard`,
      302
    );
  }

  return null;
}

const LazyEditor = lazy(() =>
  import("~/components/editor/tiptap-editor").then((m) => ({
    default: m.TiptapEditor,
  }))
);

// ─── PDCA Step Indicator ───

type PdcaStep = "idle" | "plan" | "do" | "check" | "act";

const PDCA_STEPS = [
  { key: "plan" as const, label: "Plan", desc: "構成案" },
  { key: "do" as const, label: "Do", desc: "記事生成" },
  { key: "check" as const, label: "Check", desc: "品質評価" },
  { key: "act" as const, label: "Act", desc: "改善" },
];

function PdcaIndicator({
  activeStep,
  completedSteps,
}: {
  activeStep: PdcaStep;
  completedSteps: Set<string>;
}) {
  return (
    <div className="flex items-center gap-1">
      {PDCA_STEPS.map((step, i) => {
        const isActive = activeStep === step.key;
        const isDone = completedSteps.has(step.key);
        return (
          <div key={step.key} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 h-0.5 ${isDone ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white animate-pulse"
                  : isDone
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {isDone && !isActive && <span>&#10003;</span>}
              {isActive && <span className="inline-block w-2 h-2 bg-white rounded-full" />}
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Score Display ───

function ScoreDisplay({ checkResult }: { checkResult: CheckData | null }) {
  if (!checkResult) return null;
  const metrics = [
    { label: "総合", value: checkResult.score, color: scoreColor(checkResult.score) },
    { label: "独自性", value: checkResult.originality, color: scoreColor(checkResult.originality) },
    { label: "読みやすさ", value: checkResult.readability, color: scoreColor(checkResult.readability) },
    { label: "深さ", value: checkResult.depth, color: scoreColor(checkResult.depth) },
    { label: "引き込み力", value: checkResult.engagement, color: scoreColor(checkResult.engagement) },
  ];

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-sm font-medium mb-3">品質スコア</h3>
      <div className="grid grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
      {checkResult.strengths.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-green-700 mb-1">&#9733; 良い点</div>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {checkResult.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {checkResult.improvements.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs font-medium text-orange-700 mb-1">&#9888; 改善点</div>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {checkResult.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

type CheckData = {
  score: number;
  originality: number;
  readability: number;
  depth: number;
  engagement: number;
  strengths: string[];
  improvements: string[];
};

// ─── Main Component ───

export default function EditPost({ loaderData }: Route.ComponentProps) {
  const { post, categories, user } = loaderData;
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isAdmin = user.role === "admin" || user.role === "editor";

  // PDCA state
  const [pdcaStep, setPdcaStep] = useState<PdcaStep>("idle");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [planText, setPlanText] = useState("");
  const [checkResult, setCheckResult] = useState<CheckData | null>(null);
  const [pdcaIteration, setPdcaIteration] = useState(0);
  const [customInstruction, setCustomInstruction] = useState("");

  // Store the raw transcription for AI processing
  const rawTranscription = useRef(
    post.content.replace(/<[^>]*>/g, "").trim()
  );

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (fetcher.data && "saved" in fetcher.data && fetcher.data.saved) {
      setLastSaved(
        new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
      );
    }
  }, [fetcher.data]);

  const handleAutoSave = useCallback(() => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formData.set("_intent", "save");
      fetcher.submit(formData, { method: "post" });
    }
  }, [fetcher]);

  useEffect(() => {
    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, [handleAutoSave]);

  // ─── AI API calls ───

  const callAi = async (step: string, body: Record<string, unknown>) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, ...body }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (data.error) throw new Error(data.error);
      return data.result || "";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI API エラー";
      setAiError(msg);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const handlePlan = async () => {
    setPdcaStep("plan");
    const title =
      (formRef.current?.querySelector('[name="title"]') as HTMLInputElement)
        ?.value || post.title;
    const result = await callAi("plan", {
      transcription: rawTranscription.current,
      title,
    });
    if (result) {
      setPlanText(result);
      setCompletedSteps((prev) => new Set([...prev, "plan"]));
    }
  };

  const handleGenerate = async () => {
    setPdcaStep("do");
    const title =
      (formRef.current?.querySelector('[name="title"]') as HTMLInputElement)
        ?.value || post.title;
    const result = await callAi("do", {
      transcription: rawTranscription.current,
      title,
      plan: planText,
    });
    if (result) {
      // Inject generated content into the hidden input / editor
      const contentInput = formRef.current?.querySelector(
        '[name="content"]'
      ) as HTMLInputElement;
      if (contentInput) contentInput.value = result;
      // Force page reload to update editor with new content
      handleAutoSave();
      setCompletedSteps((prev) => new Set([...prev, "do"]));
      // Auto-reload after save
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleCheck = async () => {
    setPdcaStep("check");
    const contentInput = formRef.current?.querySelector(
      '[name="content"]'
    ) as HTMLInputElement;
    const article = contentInput?.value || post.content;
    const title =
      (formRef.current?.querySelector('[name="title"]') as HTMLInputElement)
        ?.value || post.title;
    const result = await callAi("check", { article, title });
    if (result) {
      try {
        // Parse JSON from the result (might have markdown wrapping)
        const jsonStr = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr) as CheckData;
        setCheckResult(parsed);
        setCompletedSteps((prev) => new Set([...prev, "check"]));
      } catch {
        setAiError("品質評価の解析に失敗しました");
      }
    }
  };

  const handleImprove = async () => {
    setPdcaStep("act");
    const contentInput = formRef.current?.querySelector(
      '[name="content"]'
    ) as HTMLInputElement;
    const article = contentInput?.value || post.content;
    const title =
      (formRef.current?.querySelector('[name="title"]') as HTMLInputElement)
        ?.value || post.title;
    const improvements = checkResult?.improvements || [];
    const result = await callAi("act", {
      article,
      title,
      improvements,
      customInstruction: customInstruction || undefined,
    });
    if (result) {
      const ci = formRef.current?.querySelector(
        '[name="content"]'
      ) as HTMLInputElement;
      if (ci) ci.value = result;
      handleAutoSave();
      setPdcaIteration((prev) => prev + 1);
      setCompletedSteps((prev) => new Set([...prev, "act"]));
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const isTranscriptionDraft =
    post.primary_category === "etc" && post.status === "draft";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 no-underline hover:text-gray-700"
          >
            ← ダッシュボード
          </Link>
          {lastSaved && (
            <span className="text-xs text-gray-400">保存済み {lastSaved}</span>
          )}
          {fetcher.state === "submitting" && (
            <span className="text-xs text-gray-400">保存中...</span>
          )}
        </div>
        <Link
          to={`/dashboard/posts/${post.id}/preview`}
          className="text-sm text-gray-500 no-underline hover:text-gray-700"
        >
          プレビュー
        </Link>
      </div>

      {/* PDCA AI Workshop (shown for transcription drafts) */}
      {isTranscriptionDraft && (
        <div className="mb-6 border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-900">
                AI記事生成ワークショップ
              </h2>
              <p className="text-xs text-blue-600 mt-0.5">
                音声書き起こし原液 → パジスタイル長文記事
                {pdcaIteration > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-200 rounded text-[10px]">
                    {pdcaIteration}回改善済み
                  </span>
                )}
              </p>
            </div>
            <PdcaIndicator
              activeStep={aiLoading ? pdcaStep : "idle"}
              completedSteps={completedSteps}
            />
          </div>

          {aiError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {aiError}
            </div>
          )}

          {/* PDCA Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={handlePlan}
              disabled={aiLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading && pdcaStep === "plan" ? "構成案を生成中..." : "P: 構成案を生成"}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={aiLoading || !completedSteps.has("plan")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading && pdcaStep === "do" ? "記事を生成中..." : "D: 記事を生成"}
            </button>
            <button
              type="button"
              onClick={handleCheck}
              disabled={aiLoading || !completedSteps.has("do")}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading && pdcaStep === "check" ? "評価中..." : "C: 品質評価"}
            </button>
            <button
              type="button"
              onClick={handleImprove}
              disabled={aiLoading || !completedSteps.has("check")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading && pdcaStep === "act" ? "改善中..." : "A: 改善実行"}
            </button>
          </div>

          {/* Plan Output */}
          {planText && (
            <details className="mb-3" open={!completedSteps.has("do")}>
              <summary className="text-sm font-medium text-blue-800 cursor-pointer">
                構成案 (Plan)
              </summary>
              <pre className="mt-2 p-3 bg-white rounded border text-xs text-gray-700 whitespace-pre-wrap max-h-60 overflow-auto">
                {planText}
              </pre>
            </details>
          )}

          {/* Check Results */}
          <ScoreDisplay checkResult={checkResult} />

          {/* Custom Improvement Instructions */}
          {completedSteps.has("check") && (
            <div className="mt-3">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"
                placeholder="追加の改善指示（例: もっとカジュアルに、具体例を増やして）"
              />
            </div>
          )}
        </div>
      )}

      {/* Editor Form */}
      <fetcher.Form ref={formRef} method="post" className="space-y-6">
        <div>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-2 focus:outline-none focus:border-gray-900"
            placeholder="タイトル"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              name="primary_category"
              defaultValue={post.primary_category}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              抜粋
            </label>
            <input
              type="text"
              name="excerpt"
              defaultValue={post.excerpt}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="記事の概要（省略可）"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本文
          </label>
          {isClient ? (
            <Suspense
              fallback={
                <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] text-gray-400">
                  エディタを読み込み中...
                </div>
              }
            >
              <LazyEditor content={post.content} name="content" />
            </Suspense>
          ) : (
            <textarea
              name="content"
              defaultValue={post.content}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="記事の本文（HTML対応）"
            />
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            name="_intent"
            value="save"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
          >
            保存
          </button>

          {post.status === "draft" && !isAdmin && (
            <button
              type="submit"
              name="_intent"
              value="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              レビューに提出
            </button>
          )}

          {isAdmin &&
            (post.status === "draft" || post.status === "pending_review") && (
              <button
                type="submit"
                name="_intent"
                value="publish"
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                公開
              </button>
            )}

          {post.status === "draft" && (
            <button
              type="submit"
              name="_intent"
              value="delete"
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50 ml-auto"
              onClick={(e) => {
                if (!confirm("この下書きを削除しますか？")) e.preventDefault();
              }}
            >
              削除
            </button>
          )}
        </div>
      </fetcher.Form>
    </div>
  );
}
