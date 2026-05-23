import { Power } from '../types';

export const POWERS: Power[] = [
  {
    id: 'fifty_fifty',
    name: '50/50',
    type: 'advantage',
    description: 'Removes 2 wrong answers from the current question.',
    icon: 'Dices',
    supportedQuestionTypes: ['mcq', 'multi_select']
  },
  {
    id: 'absolutely_smart',
    name: 'Absolutely Smart',
    type: 'advantage',
    description: 'Highlights the correct answer with a yellow border and brain icon.',
    icon: 'BrainCircuit',
    supportedQuestionTypes: ['mcq', 'true_false', 'multi_select']
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    type: 'advantage',
    description: 'Adds 30 seconds to your current timer.',
    icon: 'Hourglass'
  },
  {
    id: 'hint_master',
    name: 'Hint Master',
    type: 'advantage',
    description: 'Reveals a helpful hint or keywords for the current question.',
    icon: 'Sparkles'
  },
  {
    id: 'shield',
    name: 'Shield',
    type: 'advantage',
    description: 'Protects you from the next offensive power used against you.',
    icon: 'ShieldCheck'
  },
  {
    id: 'auto_complete',
    name: 'Auto-Complete',
    type: 'advantage',
    description: 'Automatically fills in one blank or one matching pair correctly.',
    icon: 'Wand2',
    supportedQuestionTypes: ['fill_in_blanks', 'matching']
  },
  {
    id: 'clarity',
    name: 'Clarity',
    type: 'advantage',
    description: 'Instantly removes all active offensive effects from your screen.',
    icon: 'Eye'
  },
  {
    id: 'glitch',
    name: 'Glitch',
    type: 'offensive',
    description: 'Makes everyone\'s screen vibrate and glitch with colors.',
    icon: 'Cpu'
  },
  {
    id: 'ink_splash',
    name: 'Ink Splash',
    type: 'offensive',
    description: 'Splashes ink on the screen, obscuring parts of the question.',
    icon: 'Paintbrush'
  },
  {
    id: 'mirror',
    name: 'Mirror Mode',
    type: 'offensive',
    description: 'Flips the entire screen horizontally.',
    icon: 'FlipHorizontal'
  },
  {
    id: 'fog',
    name: 'Fog',
    type: 'offensive',
    description: 'Adds a thick fog layer over the question.',
    icon: 'CloudFog'
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    type: 'offensive',
    description: 'Shakes the screen violently.',
    icon: 'Waves'
  },
  {
    id: 'static_noise',
    name: 'Static Noise',
    type: 'offensive',
    description: 'Overlays a subtle static noise effect on the screen.',
    icon: 'Tv'
  },
  {
    id: 'upside_down',
    name: 'Upside Down',
    type: 'offensive',
    description: 'Flips the entire screen vertically.',
    icon: 'FlipVertical'
  },
  {
    id: 'vibration',
    name: 'Vibration',
    type: 'offensive',
    description: 'Makes the screen vibrate subtly.',
    icon: 'Vibrate'
  },
  {
    id: 'color_shift',
    name: 'Color Shift',
    type: 'offensive',
    description: 'Rapidly cycles the colors of the question text.',
    icon: 'Rainbow'
  },
  {
    id: 'frost',
    name: 'Frost',
    type: 'offensive',
    description: 'Ice crystals grow from the edges, freezing your view.',
    icon: 'Snowflake'
  },
  {
    id: 'scanner',
    name: 'Scanner',
    type: 'offensive',
    description: 'A security laser scans your screen, obscuring the view.',
    icon: 'ScanLine'
  },
  {
    id: 'low_battery',
    name: 'Low Battery',
    type: 'offensive',
    description: 'Simulates a low battery state with dimming and flickering.',
    icon: 'BatteryLow'
  },
  {
    id: 'click_challenge',
    name: 'Click Challenge',
    type: 'interactive',
    description: 'Locks everyone\'s screen until they click 50 times.',
    icon: 'MousePointerClick'
  },
  {
    id: 'circle_hunt',
    name: 'Circle Hunt',
    type: 'interactive',
    description: 'Random circles appear on the screen. Click 10 to clear the view.',
    icon: 'Crosshair'
  },
  {
    id: 'spin_wheel',
    name: 'Spin Wheel',
    type: 'interactive',
    description: 'Spin the wheel to win a random prize or a jackpot!',
    icon: 'Disc'
  },
  {
    id: 'bug_squasher',
    name: 'Bug Squasher',
    type: 'interactive',
    description: 'Tap 5 scurrying bugs to clear your view.',
    icon: 'Bug'
  },
  {
    id: 'pattern_lock',
    name: 'Pattern Lock',
    type: 'interactive',
    description: 'Connect the dots in the correct order to unlock.',
    icon: 'Grid3X3'
  },
  {
    id: 'slider_unlock',
    name: 'Slider Unlock',
    type: 'interactive',
    description: 'Slide the bar to the end to regain control.',
    icon: 'Sliders'
  },
  {
    id: 'pixelate',
    name: 'Pixelate',
    type: 'offensive',
    description: 'The screen becomes pixelated and blurry, making it hard to read.',
    icon: 'LayoutGrid'
  },
  {
    id: 'blackout',
    name: 'Blackout',
    type: 'offensive',
    description: 'The screen periodically flickers to black, testing your memory.',
    icon: 'Ghost'
  },
  {
    id: 'gravity',
    name: 'Gravity',
    type: 'offensive',
    description: 'The screen slowly slides down and then snaps back up.',
    icon: 'Anchor'
  },
  {
    id: 'thermal',
    name: 'Thermal Vision',
    type: 'offensive',
    description: 'Inverts colors and adds a heat-map like glow to the screen.',
    icon: 'Thermometer'
  },
  {
    id: 'old_movie',
    name: 'Old Movie',
    type: 'offensive',
    description: 'Applies a sepia tone with scratches and jittery frame rate.',
    icon: 'Film'
  },
  {
    id: 'drunken',
    name: 'Drunken Mode',
    type: 'offensive',
    description: 'The screen sways and tilts back and forth, making it hard to focus.',
    icon: 'Wine'
  },
  {
    id: 'juice',
    name: '🧃',
    type: 'offensive',
    description: 'A mysterious juice box appears with a special surprise.',
    icon: 'CupSoda'
  }
];
