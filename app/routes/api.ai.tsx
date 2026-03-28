import type { Route } from "./+types/api.ai";
import { requireAuth } from "~/lib/require-auth.server";
import {
  planArticle,
  generateArticle,
  checkArticle,
  improveArticle,
} from "~/lib/ai-writer.server";

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  await requireAuth(request, db);

  const apiKey = context.cloudflare.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const body = await request.json() as {
    step: string;
    transcription?: string;
    title?: string;
    plan?: string;
    article?: string;
    improvements?: string[];
    customInstruction?: string;
  };

  try {
    let result: string;

    switch (body.step) {
      case "plan":
        result = await planArticle(
          apiKey,
          body.transcription || "",
          body.title || ""
        );
        break;

      case "do":
        result = await generateArticle(
          apiKey,
          body.transcription || "",
          body.title || "",
          body.plan || ""
        );
        break;

      case "check":
        result = await checkArticle(
          apiKey,
          body.article || "",
          body.title || ""
        );
        break;

      case "act":
        result = await improveArticle(
          apiKey,
          body.article || "",
          body.title || "",
          body.improvements || [],
          body.customInstruction
        );
        break;

      default:
        return Response.json({ error: "Unknown step" }, { status: 400 });
    }

    return Response.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
