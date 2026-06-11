import { redirect } from "react-router";

/**
 * /share はトップページ（/）と同一内容のため 301 で恒久統合する。
 * 旧URLで張られた外部リンク・ブックマークの評価を / に集約する。
 */
export async function loader() {
  return redirect("/", 301);
}

export default function ShareIndex() {
  return null;
}
