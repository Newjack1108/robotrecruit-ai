export const SHOWCASE_CATEGORIES = {
  fishing: { icon: '🎣', label: 'Fishing Catch', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  beekeeping: { icon: '🐝', label: 'Apiary Success', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' },
  cooking: { icon: '👨‍🍳', label: 'Culinary Creation', color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
  garden: { icon: '🌱', label: 'Garden Harvest', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  fitness: { icon: '💪', label: 'Fitness Milestone', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
  diy: { icon: '🔨', label: 'DIY Project', color: 'from-gray-500/20 to-slate-500/20 border-gray-500/30' },
  sport: { icon: '⚽', label: 'Sports Achievement', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30' },
  art: { icon: '🎨', label: 'Artistic Work', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  other: { icon: '⭐', label: 'Other Achievement', color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30' },
} as const;

export type ShowcaseCategory = keyof typeof SHOWCASE_CATEGORIES;

