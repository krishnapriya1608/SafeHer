import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#4A6054] text-[#F9F8F3] font-sans border-t border-[#3B4E44] pt-16 pb-12 px-6">
      {/* Editorial Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-editorial-serif { font-family: 'Cormorant Garamond', serif; }
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-sans-clean { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#5C7366]/60">
          
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
             
              <span className="font-script text-3xl text-[#D4B683]">SafeSphere</span>
            </div>
            <p className="text-xs font-sans-clean text-[#D3DAD6] leading-relaxed max-w-sm">
              Nourishing your peace of mind with intuitive safety telemetry and automated emergency response protocols.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 font-sans-clean space-y-3">
            <h4 className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#D4B683]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-light text-[#D3DAD6]">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Overview</Link>
              </li>
              <li>
                <Link to="/sos" className="hover:text-white transition">SOS Signal</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition">Incident Reports</Link>
              </li>
              <li>
                <Link to="/checkins" className="hover:text-white transition">Routine Check-ins</Link>
              </li>
              <li>
                <Link to="/trusted-contacts" className="hover:text-white transition">Trusted Circle</Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Protocol Note */}
          <div className="md:col-span-4 font-sans-clean space-y-3">
            <h4 className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#D4B683]">
              Emergency Dispatch
            </h4>
            <p className="text-xs font-light text-[#D3DAD6] leading-relaxed">
              If you are in immediate critical danger, invoke Protocol III from your dashboard or access the direct SOS interface.
            </p>
            <div className="pt-2">
              <Link
                to="/sos"
                className="inline-block bg-[#D4B683] hover:bg-[#c2a370] text-[#2C3531] px-5 py-2 text-[10px] font-semibold tracking-[0.2em] uppercase transition"
              >
                Trigger SOS
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans-clean text-[10px] uppercase tracking-[0.25em] text-[#C2C9C5]">
          <p>© {new Date().getFullYear()} SafeSphere. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition">Terms of Service</a>
            <a href="#contact" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}