import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CategoryChip({ category }) {
  return (
    <Link to={`/shop?category=${category.slug}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="flex flex-col items-center gap-2 shrink-0"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-smoke flex items-center justify-center text-2xl md:text-3xl border border-black/5 hover:border-brand-yellow hover:bg-brand-yellow/10 transition-colors">
          {category.emoji}
        </div>
        <span className="text-xs font-semibold text-black/70">{category.name}</span>
      </motion.div>
    </Link>
  )
}
