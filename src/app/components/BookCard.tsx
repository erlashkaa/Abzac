import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Rating } from './Rating';
import { type Book } from '../api/booksApi';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const BookCard: React.FC<{ book: Book }> = React.memo(({ book }) => {
  const genres = (book.genre || '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="group w-full"
    >
      <div className="relative rounded-[26px] border border-border-color/35 bg-bg-secondary/20 overflow-hidden shadow-soft">
        {/* Glow */}
        <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 smooth-transition">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.22),transparent_55%)] blur-2xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(139,92,246,0.16),transparent_55%)] blur-2xl" />
        </div>

        <Link to={`/book/${book.id}`} className="block p-3">
          <div className="relative aspect-[2/3] rounded-[22px] overflow-hidden border border-border-color/30 bg-bg-tertiary/30">
            <ImageWithFallback
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.08] smooth-transition-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-80" />

            <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl glass-effect-light border border-border-color/30 text-xs font-black text-text-primary">
                Читать
                <ArrowUpRight className="w-4 h-4 text-accent-color" />
              </span>
              <span className="ml-auto text-[11px] font-bold text-text-secondary px-2.5 py-2 rounded-2xl bg-black/35 border border-white/10">
                {book.year}
              </span>
            </div>
          </div>
        </Link>

        <div className="px-4 pb-4 -mt-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/book/${book.id}`}
              className="text-[15px] font-black leading-snug tracking-tight text-text-primary line-clamp-2 hover:text-accent-color smooth-transition"
              title={book.title}
            >
              {book.title}
            </Link>
          </div>

          <div className="mt-1.5 text-xs text-secondary font-semibold line-clamp-1">{book.author}</div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Rating rating={book.rating} size={12} />
              <span className="text-[10px] text-tertiary">({book.reviews_count})</span>
            </div>

            <div className="flex flex-wrap justify-end gap-1.5">
              {genres.map((label) => (
                <span
                  key={label}
                  className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-accent-color/10 text-accent-color border border-accent-color/15"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
});
