import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TeamSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { SlideBackground } from './SlideBackground';
import { User, Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamSlideProps {
  slide: TeamSlideData;
  settings?: SlideStyleSettings;
}

export const TeamSlide: React.FC<TeamSlideProps> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const { title, members } = slide;
  const columns = currentSettings.gridColumns || (members.length > 5 ? 5 : members.length > 3 ? 4 : members.length);

  const getColsClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 6: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col p-6 lg:p-10 overflow-hidden" id={slide.id}>
      <SlideBackground type="image-text" /> 
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col h-full items-stretch justify-center"
      >
        <motion.div 
          className="font-bold tracking-tight text-slate-900 text-center markdown-content shrink-0"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: `${(currentSettings.titleSize || 100) * 0.01 * (members.length > 4 ? 2.25 : 3.75)}rem`,
            textAlign: currentSettings.titleAlignment || 'center',
            letterSpacing: `${(currentSettings.titleLetterSpacing || -0.02)}em`,
            lineHeight: currentSettings.titleLineHeight || 1.1,
            marginBottom: members.length > 4 ? '1.5rem' : '2.5rem'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {title}
          </ReactMarkdown>
        </motion.div>
 
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col justify-center">
          <div className={`grid gap-4 pb-12 overflow-y-auto scrollbar-none py-4 px-2 ${getColsClass()}`}>
            {members.map((member, index) => (
              <motion.div
                key={member.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="flex flex-col items-center group shrink-0"
              >
                <div className={`relative ${members.length > 4 ? 'mb-2' : 'mb-4'}`}>
                    <div className="absolute inset-0 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-10" style={{ backgroundColor: 'var(--accent-color, #6366f1)' }} />
                   <div className={`relative rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-100 flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all duration-500 ${members.length > 4 ? 'w-20 h-20' : 'w-36 h-36'}`}>
                      {member.imageUrl ? (
                        <img 
                          src={member.imageUrl} 
                          alt={member.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User size={members.length > 4 ? 24 : 48} className="text-slate-300" />
                      )}
                   </div>
                </div>

                <div 
                  className="text-center w-full px-1"
                  style={{
                    textAlign: currentSettings.contentAlignment || 'center'
                  }}
                >
                  <div 
                    className={`font-bold text-slate-900 transition-colors markdown-content truncate`}
                    style={{
                      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (members.length > 4 ? 0.875 : 1.125)}rem`,
                      letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`,
                      color: 'var(--text-color, inherit)'
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {member.name}
                    </ReactMarkdown>
                  </div>
                  <div 
                    className={`font-black uppercase tracking-[0.1em] mb-1 opacity-80 markdown-content truncate`}
                    style={{
                      fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (members.length > 4 ? 0.45 : 0.55)}rem`,
                      color: 'var(--accent-color, #6366f1)'
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {member.role}
                    </ReactMarkdown>
                  </div>
                  {member.bio && (
                    <div 
                      className={`text-slate-500 leading-tight mx-auto font-medium mb-2 markdown-content line-clamp-2`}
                      style={{
                        fontSize: `${(currentSettings.contentSize || 100) * 0.01 * (members.length > 4 ? 0.625 : 0.75)}rem`,
                        lineHeight: currentSettings.contentLineHeight || 1.25,
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {member.bio}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                    <Linkedin size={12} className="text-slate-400 cursor-pointer transition-colors" style={{ '--hover-color': 'var(--accent-color, #6366f1)' } as any} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')} onMouseLeave={(e) => (e.currentTarget.style.color = '')} />
                    <Twitter size={12} className="text-slate-400 cursor-pointer transition-colors" onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')} onMouseLeave={(e) => (e.currentTarget.style.color = '')} />
                    <Mail size={12} className="text-slate-400 cursor-pointer transition-colors" onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')} onMouseLeave={(e) => (e.currentTarget.style.color = '')} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
