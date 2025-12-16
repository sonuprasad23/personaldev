import { motion } from 'framer-motion';
import { Flame, Github, Linkedin, Twitter, Heart, ExternalLink, Code, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const socialLinks = [
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/PrasadMarco', handle: '@PrasadMarco', color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/sonu-prasad23/', handle: 'sonu-prasad23', color: '#0A66C2' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/sonuprasad23', handle: 'sonuprasad23', color: '#ffffff' },
  ];

  const features = [
    'Track daily tasks & habits',
    'Exercise & workout logging',
    'Book reading progress',
    'Language learning with vocabulary',
    'Weekly goal setting',
    'YouTube media analytics',
    'Calendar view & streaks',
    'Google Sheets sync',
    'Export in JSON/PDEV format',
    'Works offline',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--green)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--accent)]/30">
          <Flame className="w-12 h-12 text-black" />
        </div>
        <h1 className="hero-header text-4xl lg:text-5xl">PersonaDev</h1>
        <p className="text-[var(--text-secondary)] mt-3 text-lg">Your Personal Development Tracker</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">Version 2.0.0</p>
      </motion.div>

      {/* About */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="block"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[var(--accent)]" /> About
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          PersonaDev is a comprehensive personal development tracker designed to help you build better habits, 
          track your progress, and achieve your goals. Whether it's daily tasks, exercise routines, reading habits, 
          or learning new languages — PersonaDev helps you stay consistent and motivated.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="block"
      >
        <h2 className="text-xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl p-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--green)]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="block"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Code className="w-6 h-6 text-[var(--purple)]" /> Created By
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[var(--bg-elevated)] rounded-3xl p-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--accent)] flex items-center justify-center text-4xl font-bold">
            SP
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold">Sonu Prasad</h3>
            <p className="text-[var(--text-secondary)] mt-1">Full Stack Developer & Creator</p>
            <div className="flex gap-3 mt-4 justify-center sm:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon hover:scale-110 transition-transform"
                  style={{ '--hover-color': link.color }}
                  title={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="block"
      >
        <h2 className="text-xl font-bold mb-4">Connect</h2>
        <div className="space-y-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="list-item hover:border-[var(--accent)] border border-transparent transition-colors group"
            >
              <div className="icon-box" style={{ background: `${link.color}20` }}>
                <link.icon className="w-6 h-6" style={{ color: link.color }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{link.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{link.handle}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-[var(--text-muted)] flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-[var(--red)]" /> by Sonu Prasad
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-2">© {new Date().getFullYear()} PersonaDev. All rights reserved.</p>
      </motion.div>
    </div>
  );
}

