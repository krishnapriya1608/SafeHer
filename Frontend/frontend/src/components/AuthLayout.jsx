import { motion } from "framer-motion";
import Logo from "./Logo";

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  image,
  imageClass = "h-screen",
  children,
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Image */}
        <motion.section
          className="hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <img
            src={image}
            alt={title}
              className={`${imageClass} w-full object-cover`}
            
          />
        </motion.section>

        {/* Right Side */}
        <motion.section
          className="flex items-center justify-center px-8 py-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-full max-w-md">
            <Logo />

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
              {eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {title}
            </h2>

            <p className="mt-2 text-slate-500">
              {subtitle}
            </p>

            <div className="mt-6">
              {children}
            </div>
          </div>
        </motion.section>

      </div>
    </main>
  );
}