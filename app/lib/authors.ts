export type Author = {
  name: string;
  nameReading: string;
  nickname: string;
  bio: string;
  url: string;
  avatarUrl?: string;
  sameAs: string[];
};

const AUTHORS: Record<string, Author> = {
  paji: {
    name: "安宅 基",
    nameReading: "あたか はじめ",
    nickname: "パジ",
    bio: "連続起業家・現役スタートアップ経営者。2011年Tokyo Otaku Mode共同創業、海外2,000万人規模メディアから越境EC・翻訳・広告・配送代行まで自社一気通貫で推し活文化を世界に届ける。ゲーム攻略本ライター→Webディレクター→フリーエンジニアで起業、複数事業バイアウト経験。スタートアップとブロックチェーンに精通し、ゼロからの事業創出と新技術のかけ合わせを得意とする。最近のイチオシはAIバイブコーディング。",
    url: "https://note.com/hajimeataka",
    avatarUrl: "/images/paji-avatar.jpg",
    sameAs: [
      "https://x.com/paji_a",
      "https://note.com/hajimeataka",
      "https://thekeyperson.biz/interview/%E5%AE%89%E5%AE%85%E5%9F%BA/",
    ],
  },
};

/** Default author for legacy articles without a specific author */
const DEFAULT_AUTHOR: Author = {
  name: "書き起こし.com編集部",
  nameReading: "",
  nickname: "",
  bio: "講演・インタビュー・スピーチの書き起こし記事を制作・編集しています。",
  url: "https://kakiokosi.com/share/about",
  sameAs: [],
};

/**
 * Get author by user ID. Falls back to editorial team.
 * Maps known author_id values to their profiles.
 */
export function getAuthor(authorId: string | null): Author {
  if (!authorId) return DEFAULT_AUTHOR;

  // Map DB author_id to author key
  // Add mappings here as authors are registered
  for (const [, author] of Object.entries(AUTHORS)) {
    // Match by checking if the authorId corresponds to a known author
    // For now, any non-null author_id maps to paji (site owner)
    return author;
  }

  return DEFAULT_AUTHOR;
}

/** Generate JSON-LD Person schema for an author */
export function authorJsonLd(author: Author) {
  return {
    "@type": "Person" as const,
    name: author.nickname ? `${author.name}（${author.nickname}）` : author.name,
    url: author.url,
    ...(author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
    ...(author.bio ? { description: author.bio } : {}),
  };
}
