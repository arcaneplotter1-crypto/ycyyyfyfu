import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChartSlideData, SlideStyleSettings } from '../../../presentationTypes';
import { SlideBackground } from './SlideBackground';

interface ChartSlideProps {
  slide: ChartSlideData;
  settings?: SlideStyleSettings;
}

export const ChartSlide: React.FC<ChartSlideProps> = ({ slide, settings }) => {
  const currentSettings = settings || slide.settings || {};
  const { title, subtitle, data: chartData } = slide;
  const chartType = currentSettings.chartType || 'bar';
  const showGrid = currentSettings.showGrid !== false;
  const showLegend = currentSettings.showLegend !== false;
  const showTooltip = currentSettings.showTooltip !== false;

  const accentColor = 'var(--accent-color, #6366f1)';
  
  // Default data if none provided
  const displayData = useMemo(() => {
    if (chartData && chartData.length > 0) return chartData;
    return [
      { name: 'Mon', value: 400 },
      { name: 'Tue', value: 300 },
      { name: 'Wed', value: 600 },
      { name: 'Thu', value: 800 },
      { name: 'Fri', value: 500 },
    ];
  }, [chartData]);

  const COLORS = [
    accentColor,
    'color-mix(in srgb, var(--accent-color, #6366f1) 80%, black)',
    'color-mix(in srgb, var(--accent-color, #6366f1) 60%, black)',
    'color-mix(in srgb, var(--accent-color, #6366f1) 40%, black)',
    'color-mix(in srgb, var(--accent-color, #6366f1) 20%, black)',
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={displayData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            {showTooltip && <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />}
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={accentColor} 
              strokeWidth={4} 
              dot={{ r: 6, fill: accentColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={displayData}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
            >
              {displayData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={displayData}>
             <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            {showTooltip && <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />}
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={accentColor} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={displayData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            {showTooltip && <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />}
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Bar 
              dataKey="value" 
              fill={accentColor} 
              radius={[6, 6, 0, 0]} 
              barSize={settings?.chartThickness || 40}
              animationDuration={1500}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col p-8 lg:p-12 overflow-hidden" id={slide.id}>
      <SlideBackground type="chart" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col h-full items-stretch justify-center"
      >
        <div className="mb-8 shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-bold tracking-tight text-slate-900 markdown-content"
            style={{
              fontSize: `${(currentSettings.titleSize || 100) * 0.01 * 3}rem`,
              textAlign: currentSettings.titleAlignment || 'left',
              letterSpacing: `${(currentSettings.titleLetterSpacing || -0.02)}em`,
              lineHeight: currentSettings.titleLineHeight || 1.1,
              marginBottom: subtitle ? '0.5rem' : '0'
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {title}
            </ReactMarkdown>
          </motion.div>
          {subtitle && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-600 font-medium markdown-content"
              style={{
                fontSize: `${(currentSettings.contentSize || 100) * 0.01 * 1.25}rem`,
                textAlign: currentSettings.contentAlignment || 'left',
                lineHeight: currentSettings.contentLineHeight || 1.4,
                letterSpacing: `${(currentSettings.contentLetterSpacing || 0)}em`
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {subtitle}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-h-0 w-full flex flex-col justify-center">
          <div className="h-full w-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 p-6 lg:p-10 shadow-xl overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative elements for chart slide */}
        <div className="mt-6 flex justify-between items-center opacity-40 shrink-0">
           <div className="flex gap-4 text-[10px] font-mono tracking-widest uppercase text-slate-500">
              <span>Data Source: Internal Analytics</span>
              <span>•</span>
              <span>Updated: Real-time</span>
           </div>
           <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full" 
                style={{ backgroundColor: accentColor }}
                initial={{ width: 0 }} 
                whileInView={{ width: '70%' }} 
                transition={{ duration: 2, ease: "easeOut" }}
              />
           </div>
        </div>
      </motion.div>
    </div>
  );
};
