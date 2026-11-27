import c1 from "@/assets/cover-1.jpg";
import c2 from "@/assets/cover-2.jpg";
import c3 from "@/assets/cover-3.jpg";
import c4 from "@/assets/cover-4.jpg";
import hero from "@/assets/hero.jpg";
import promo from "@/assets/promo.jpg";

export type Chapter = {
  num: number; title: string; pages: string[]; updated: string;
};

export type Manga = {
  slug: string; title: string; cover: string; banner: string; genres: string[];
  rating: number; votes: string; chapters: number; status: string;
  updated: string; synopsis: string; chapterList: Chapter[];
};

const syn = (hero: string) =>
  `${hero} Follow an unforgettable journey of growth, rivalry and friendship as every chapter raises the stakes higher than before. Battles become fiercer, secrets unravel, and the world reveals mysteries no one expected.`;

const pages = (count: number, img: string) =>
  Array.from({ length: count }, (_, i) => img);

export const mangas: Manga[] = [
  {
    slug: "solo-leveling", title: "Solo Leveling", cover: c1, banner: hero,
    genres: ["Action", "Adventure", "Fantasy", "Manhwa"], rating: 9.8, votes: "2.1M",
    chapters: 200, status: "Ongoing", updated: "2 hours ago",
    synopsis: syn("After being known as the weakest hunter, Sung Jin-Woo rises through a mysterious system, unlocking unimaginable power."),
    chapterList: [
      { num: 200, title: "Arise", pages: pages(45, c1), updated: "2 hours ago" },
      { num: 199, title: "Monarch's Return", pages: pages(40, c2), updated: "1 day ago" },
      { num: 198, title: "Shadow Army", pages: pages(38, c3), updated: "3 days ago" },
    ],
  },
  {
    slug: "jujutsu-kaisen", title: "Jujutsu Kaisen", cover: c2, banner: promo,
    genres: ["Action", "Fantasy", "Supernatural"], rating: 9.5, votes: "1.8M",
    chapters: 270, status: "Ongoing", updated: "32 minutes ago",
    synopsis: syn("Yuji Itadori swallows a cursed finger and is thrown into a hidden world of sorcerers and curses."),
    chapterList: [
      { num: 270, title: "Domain Clash", pages: pages(35, c2), updated: "32 minutes ago" },
      { num: 269, title: "Cursed Womb", pages: pages(32, c1), updated: "1 day ago" },
      { num: 268, title: "Six Eyes", pages: pages(30, c3), updated: "2 days ago" },
    ],
  },
  {
    slug: "tokyo-revengers", title: "Tokyo Revengers", cover: c3, banner: hero,
    genres: ["Action", "Drama"], rating: 9.1, votes: "1.2M",
    chapters: 278, status: "Completed", updated: "3 days ago",
    synopsis: syn("Takemichi travels back in time to save the girl he loved from a ruthless gang."),
    chapterList: [
      { num: 278, title: "Final Leap", pages: pages(38, c3), updated: "3 days ago" },
      { num: 277, title: "Timelines", pages: pages(34, c4), updated: "1 week ago" },
    ],
  },
  {
    slug: "frieren", title: "Frieren", cover: c4, banner: promo,
    genres: ["Fantasy", "Adventure", "Drama"], rating: 9.7, votes: "1.5M",
    chapters: 140, status: "Ongoing", updated: "1 day ago",
    synopsis: syn("After defeating the Demon King, the elf mage Frieren sets out to understand the humans she once traveled with."),
    chapterList: [
      { num: 140, title: "Beyond the Sky", pages: pages(33, c4), updated: "1 day ago" },
      { num: 139, title: "Memory of Flowers", pages: pages(31, c1), updated: "5 days ago" },
    ],
  },
  {
    slug: "chainsaw-man", title: "Chainsaw Man", cover: c1, banner: hero,
    genres: ["Action", "Horror"], rating: 9.3, votes: "1.6M",
    chapters: 174, status: "Ongoing", updated: "1 hour ago",
    synopsis: syn("Denji merges with his devil dog Pochita and becomes a devil hunter with chainsaws for limbs."),
    chapterList: [
      { num: 174, title: "Chainsaw Revival", pages: pages(36, c1), updated: "1 hour ago" },
      { num: 173, title: "Devil Contract", pages: pages(33, c2), updated: "2 days ago" },
    ],
  },
  {
    slug: "blue-lock", title: "Blue Lock", cover: c2, banner: promo,
    genres: ["Sports", "Drama"], rating: 9.0, votes: "980K",
    chapters: 289, status: "Ongoing", updated: "18 minutes ago",
    synopsis: syn("Three hundred strikers compete in a brutal program to create Japan's ultimate egoist forward."),
    chapterList: [
      { num: 289, title: "Egoist Goal", pages: pages(37, c2), updated: "18 minutes ago" },
      { num: 288, title: "Final Trial", pages: pages(35, c1), updated: "1 day ago" },
    ],
  },
  {
    slug: "one-piece", title: "One Piece", cover: c3, banner: hero,
    genres: ["Action", "Adventure", "Fantasy"], rating: 9.6, votes: "3.2M",
    chapters: 1110, status: "Ongoing", updated: "5 hours ago",
    synopsis: syn("Monkey D. Luffy sets sail to find the One Piece and become the King of the Pirates."),
    chapterList: [
      { num: 1110, title: "One Piece", pages: pages(42, c3), updated: "5 hours ago" },
      { num: 1109, title: "Laugh Tale", pages: pages(40, c4), updated: "1 week ago" },
    ],
  },
  {
    slug: "berserk", title: "Berserk", cover: c4, banner: promo,
    genres: ["Action", "Drama", "Fantasy", "Horror"], rating: 9.4, votes: "1.4M",
    chapters: 370, status: "Ongoing", updated: "1 month ago",
    synopsis: syn("Guts, a lone mercenary, battles fate and demons in a dark medieval world."),
    chapterList: [
      { num: 370, title: "Black Swordsman", pages: pages(44, c4), updated: "1 month ago" },
    ],
  },
  {
    slug: "naruto", title: "Naruto", cover: c1, banner: hero,
    genres: ["Action", "Adventure", "Fantasy"], rating: 8.9, votes: "2.5M",
    chapters: 720, status: "Completed", updated: "1 year ago",
    synopsis: syn("Naruto Uzumaki strives to become Hokage and earn the respect of his village."),
    chapterList: [
      { num: 720, title: "Hokage", pages: pages(41, c1), updated: "1 year ago" },
    ],
  },
];

export const getManga = (slug: string) => mangas.find((m) => m.slug === slug);
export const getChapter = (slug: string, num: number) => {
  const m = getManga(slug);
  return m?.chapterList.find((c) => c.num === num);
};
export const allGenres = [...new Set(mangas.flatMap((m) => m.genres))].sort();
