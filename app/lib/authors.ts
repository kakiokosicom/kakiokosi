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
  name: "書き起こし.com",
  nameReading: "",
  nickname: "編集部",
  bio: "2011年から講演・インタビュー・スピーチの書き起こし記事を制作・編集しています。ビジネス、政治、社会、IT、エンターテイメントなど幅広いジャンルのトークを正確に文字に起こし、知識として共有しています。",
  url: "https://kakiokosi.com/share/about",
  sameAs: [
    "https://x.com/paji_a",
  ],
};

/**
 * Get author for a post. Uses author_id first, then falls back to
 * detecting audio-originated posts (voicy_url) as paji's content.
 */
export function getAuthor(authorId: string | null, hasAudioUrl = false): Author {
  if (authorId) {
    // Any registered author_id maps to paji (site owner) for now
    return AUTHORS.paji;
  }

  // Posts with voicy_url are paji's audio-originated content
  if (hasAudioUrl) {
    return AUTHORS.paji;
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
