import React, { useState } from 'react';
import { 
  BellRing, 
  MapPin, 
  PhoneCall, 
  Users, 
  ShieldAlert, 
  Navigation, 
  ArrowRight 
} from 'lucide-react';

const servicesData = [
  {
    id: 'sos',
    icon: BellRing,
    title: 'One-Tap Emergency SOS',
    shortDesc: 'Instantly notify emergency services and designated contacts with your live location.',
    fullDesc: 'Triggers an immediate high-priority alert. It sends SMS and app notifications with continuous GPS tracking to your trusted circle and local law enforcement within seconds.',
    badge: 'Core Feature'
  },
  {
    id: 'routes',
    icon: Navigation,
    title: 'Safe Navigation & Audio Escort',
    shortDesc: 'AI-assisted routing based on safety scores, lighting, and community feedback.',
    fullDesc: 'Avoid poorly lit or isolated areas. Enables optional automated check-ins and live audioEscort monitored by AI to flag unusual stops or route changes.',
    badge: 'AI Powered'
  },
  {
    id: 'fake-call',
    icon: PhoneCall,
    title: 'Discreet Fake Call Trigger',
    shortDesc: 'Discreetly simulate realistic incoming calls to exit uncomfortable situations safely.',
    fullDesc: 'Customizable caller ID and pre-recorded realistic voice prompts let you interrupt uncomfortable interactions or step away without drawing unwanted attention.',
    badge: 'Discreet Mode'
  },
  {
    id: 'circle',
    icon: Users,
    title: 'Guardian Safety Circles',
    shortDesc: 'Create trusted groups for family and friends to monitor late-night commutes.',
    fullDesc: 'Set up temporary or permanent circles. Members get automated arrival notifications, real-time battery status alerts, and arrival estimates for night travel.',
    badge: 'Community'
  },
  {
    id: 'safe-zones',
    icon: MapPin,
    title: 'Verified Safe Zones Map',
    shortDesc: 'Locate 24/7 open stores, police stations, and partner safe havens nearby.',
    fullDesc: 'Integrated directory of verified safe havens—including hospitals, 24/7 pharmacies, and participating local businesses equipped to offer temporary shelter.',
    badge: 'Real-time'
  },
  {
    id: 'incident',
    icon: ShieldAlert,
    title: 'Anonymous Incident Reporting',
    shortDesc: 'Report unsafe areas, harassment, or lighting issues to inform others.',
    fullDesc: 'Crowdsource safety information anonymously. Reports update local safety heatmaps to help other women navigate better and push authorities for infrastructure fixes.',
    badge: 'Crowdsourced'
  }
];

const SafeHerServices = () => {
  const [activeTab, setActiveTab] = useState(servicesData[0].id);

  return (
    <section className="py-20 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-600 uppercase tracking-wider">
            Our Key Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-4">
            Comprehensive Protection Designed for Every Situation
          </h2>
          <p className="text-lg text-slate-600">
            From proactive prevention to immediate emergency dispatch, explore how SafeHer keeps you secure throughout your day.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => {
            const IconComponent = service.icon;
            const isSelected = activeTab === service.id;

            return (
              <div
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`cursor-pointer rounded-2xl p-7 transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-rose-50/40 border-rose-300 shadow-lg ring-1 ring-rose-400' 
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-rose-500 text-white' : 'bg-white text-rose-500 shadow-sm'}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {isSelected ? service.fullDesc : service.shortDesc}
                </p>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
                  <span>{isSelected ? 'Currently Viewing' : 'Learn details'}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SafeHerServices;