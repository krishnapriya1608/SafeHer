import { motion } from "framer-motion";
import Logo from "./Logo";
import safeHer from '../assets/side profile.jpg'

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="auth-bg min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="hidden lg:block"
          >
            <Logo />
            <div className="mt-16 max-w-xl">
              <img className="object-contain w-full max-w-md" src={safeHer} alt="SafeHer" />
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["JWT Secured", "OTP Verified", "Role Based"].map((item) => (
                <div key={item} className="glass rounded-2xl px-4 py-5 text-sm font-bold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="glass mx-auto w-full max-w-xl rounded-[2rem] p-5 shadow-soft sm:p-8"
          >
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Logo />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
