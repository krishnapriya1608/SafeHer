import React from 'react';
import { ShieldCheck, Heart, Users, MapPin, Bell, Radio } from 'lucide-react';

const AboutSafeHer = () => {
  const stats = [
    { label: 'Active Users Protected', value: '100K+' },
    { label: 'Emergency Alerts Sent', value: '50K+' },
    { label: 'Trusted Safe Zones', value: '1,200+' },
    { label: 'Response Time', value: '< 2 mins' },
  ];

  const features = [
    {
      icon: <Radio className="w-6 h-6 text-rose-500" />,
      title: 'Real-Time SOS Dispatch',
      description: 'Instant live-location sharing with trusted contacts and nearby safety networks at a single tap.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-rose-500" />,
      title: 'Safe Route Mapping',
      description: 'Community-driven route suggestions based on street lighting, crowd density, and safety reports.',
    },
    {
      icon: <Users className="w-6 h-6 text-rose-500" />,
      title: 'Community Network',
      description: 'Connect with verified volunteers and local responders ready to assist during emergencies.',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-600 uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" /> About SafeHer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Empowering Women with Safety, Independence, and Peace of Mind
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            SafeHer was built on a simple belief: everyone deserves to navigate the world without fear. We combine real-time technology with community support to create a safer environment everywhere you go.
          </p>
        </div>

        {/* Core Value / Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-start"
            >
              <div className="p-3 bg-rose-50 rounded-xl mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-black text-rose-400 mb-1">{stat.value}</span>
                <span className="text-sm font-medium text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSafeHer;