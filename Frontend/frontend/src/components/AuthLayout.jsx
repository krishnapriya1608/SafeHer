import { motion } from "framer-motion";
import Logo from "./Logo";
import loginImage from '../assets/Logins.jpg';

export default function AuthLayout({ eyebrow, title, subtitle, children, bggradient,image }) {
 const gradients = {
  sky: "bg-gradient-to-br from-[#E0F2FE] via-[#F0FDF4] to-[#CCFBF1]",
  purple: "bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200",
  green: "bg-gradient-to-br from-green-100 via-emerald-100 to-teal-200",
  black:"bg-gradient-to-b from-white via-white to-slate-100"
};
  return (
    <main className="min-h-screen bg-slate-50 font-sans antialiased">
      <div className="grid min-h-screen w-full lg:grid-cols-[0.95fr_1.05fr]">

        {/* Left Section: Image (Hidden on mobile) */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative hidden lg:block h-screen sticky top-0 overflow-hidden"
        >
          <img
            src={image}
            alt="Login visual"
            className="w-full h-full object-cover object-center"
          />
        </motion.section>

        {/* Right Section: Bright, High-Energy Colorful Gradient */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className={`relative flex flex-col justify-between min-h-screen p-6 sm:p-12 lg:p-16 xl:p-24 ${gradients[bggradient]}`}
        >
          {/* Extra vibrant colorful ambient glow in the background */}
          <div className="absolute top-10 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-sky-400/30 blur-[80px]" />
          <div className="absolute bottom-10 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-400/30 blur-[80px]" />

          {/* Header / Logo Area */}
          <div className="flex items-center justify-between">
            <Logo />
          </div>

          {/* Main Content Area */}
          <div className="my-auto py-10 max-w-md w-full mx-auto relative z-10">
            {/* Eyebrow - Deep Emerald Badge */}
            {eyebrow && (
              <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-800 bg-emerald-200/60 px-3.5 py-1.5 rounded-full mb-4">
                {eyebrow}
              </span>
            )}

            {/* Title & Subtitle styled to contrast beautifully with the bright background */}
            <h2 className="text-3xl font-black tracking-tight text-teal-950 sm:text-4xl lg:leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 text-sm font-medium leading-relaxed text-teal-900/80 sm:text-base">
                {subtitle}
              </p>
            )}

            {/* Input Form Fields */}
            <div className="mt-8">
              {children}
            </div>
          </div>

          {/* Footer Area with subtle text colored to blend with the background */}
          <div className="pt-6 border-t border-teal-900/10 text-xs font-medium text-teal-800/60 flex justify-between">
            <p>© {new Date().getFullYear()}</p>
            <div className="space-x-4">
              <a href="#" className="hover:text-teal-950 transition">Terms</a>
              <a href="#" className="hover:text-teal-950 transition">Privacy</a>
            </div>
          </div>

        </motion.section>
      </div>
    </main>
  );
}