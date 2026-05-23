import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Heart, Sword, Shield, Zap, TrendingUp, Sparkles, 
  ShoppingBag, Star, Package, ChevronRight, CheckCircle2,
  Lock, ArrowUpCircle, Hammer, Info
} from 'lucide-react';
import { RpgProgression, AppTheme } from '../types';

interface RpgShopModalProps {
  progression: RpgProgression;
  onUpdateProgression: (p: RpgProgression) => void;
  onClose: () => void;
  theme: AppTheme;
}

type ShopTab = 'upgrades' | 'gear' | 'inventory' | 'heroes';

interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'hero';
  cost: number;
  bonus: Partial<RpgProgression['stats']>;
  desc: string;
  icon: string | React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const GEAR_ITEMS: ShopItem[] = [
  { id: 'rusty_blade', name: 'Rusty Blade', type: 'weapon', cost: 100, bonus: { attack: 5 }, desc: 'Better than a stick.', icon: '🗡️', rarity: 'common' },
  { id: 'shadow_dagger', name: 'Shadow Dagger', type: 'weapon', cost: 450, bonus: { attack: 15 }, desc: 'Strikes from the dark.', icon: '🔪', rarity: 'rare' },
  { id: 'leather_tunic', name: 'Leather Tunic', type: 'armor', cost: 120, bonus: { defense: 4, maxHp: 20 }, desc: 'Basic protection.', icon: '👕', rarity: 'common' },
  { id: 'iron_plate', name: 'Iron Plate', type: 'armor', cost: 500, bonus: { defense: 12, maxHp: 50 }, desc: 'Heavy and reliable.', icon: '🛡️', rarity: 'rare' },
  { id: 'lucky_charm', name: 'Lucky Charm', type: 'accessory', cost: 200, bonus: { maxHp: 15, attack: 2 }, desc: 'Smells like clover.', icon: '🍀', rarity: 'common' },
  { id: 'dragon_scale', name: 'Dragon Scale', type: 'accessory', cost: 800, bonus: { defense: 8, attack: 8, maxHp: 100 }, desc: 'Immense power.', icon: '💎', rarity: 'epic' },
];

export const HERO_ITEMS: ShopItem[] = [
  { id: 'wizard', name: 'Wizard', type: 'hero', cost: 0, bonus: { attack: 5, defense: 5, maxHp: 20 }, desc: 'Master of arcane arts.', icon: '🧙', rarity: 'common' },
  { id: 'knight', name: 'Knight', type: 'hero', cost: 0, bonus: { attack: 5, defense: 5, maxHp: 20 }, desc: 'Stalwart defender.', icon: '⚔️', rarity: 'common' },
  { id: 'robot', name: 'Robot', type: 'hero', cost: 0, bonus: { attack: 5, defense: 5, maxHp: 20 }, desc: 'Mechanical precision.', icon: '🤖', rarity: 'common' },
];

export const ALL_SHOP_ITEMS: ShopItem[] = [...GEAR_ITEMS, ...HERO_ITEMS];

const STAT_UPGRADES = [
  { id: 'maxHp', name: 'Vitality', icon: Heart, desc: 'Maximum Health Pool', baseCost: 50, growth: 1.5, bonus: 10, unit: 'HP', color: 'text-rose-500' },
  { id: 'attack', name: 'Strength', icon: Sword, desc: 'Damage Potential', baseCost: 75, growth: 1.6, bonus: 2, unit: 'Atk', color: 'text-amber-500' },
  { id: 'defense', name: 'Toughness', icon: Shield, desc: 'Incoming Damage Reduction', baseCost: 75, growth: 1.6, bonus: 1, unit: 'Def', color: 'text-blue-500' },
];

export const RpgShopModal: React.FC<RpgShopModalProps> = ({ progression, onUpdateProgression, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('upgrades');

  const getUpgradeLevel = (id: string) => (progression.unlockedUpgrades && progression.unlockedUpgrades[id]) || 0;
  
  const getUpgradeCost = (id: string, baseCost: number, growth: number) => {
    const level = getUpgradeLevel(id);
    return Math.floor(baseCost * Math.pow(growth, level));
  };

  const handleStatUpgrade = (upgradeId: string, cost: number, bonus: number) => {
    if (progression.totalCoins < cost) return;
    const next = { ...progression, unlockedUpgrades: { ...(progression.unlockedUpgrades || {}) } };
    next.totalCoins -= cost;
    next.unlockedUpgrades[upgradeId] = (next.unlockedUpgrades[upgradeId] || 0) + 1;
    if (upgradeId === 'maxHp') next.stats.maxHp += bonus;
    if (upgradeId === 'attack') next.stats.attack += bonus;
    if (upgradeId === 'defense') next.stats.defense += bonus;
    onUpdateProgression(next);
  };

  const buyGear = (item: ShopItem) => {
    if (progression.totalCoins < item.cost || (progression.inventory && progression.inventory.includes(item.id))) return;
    const next = { ...progression, inventory: [...(progression.inventory || []), item.id] };
    next.totalCoins -= item.cost;
    onUpdateProgression(next);
    setActiveTab('inventory');
  };

  const toggleEquip = (item: ShopItem) => {
    const slot = item.type;
    const currentEquipped = progression.equipped?.[slot as 'weapon' | 'armor' | 'accessory' | 'hero'] === item.id ? null : item.id;
    
    const next: RpgProgression = { 
      ...progression, 
      equipped: { 
        weapon: progression.equipped?.weapon ?? null,
        armor: progression.equipped?.armor ?? null,
        accessory: progression.equipped?.accessory ?? null,
        hero: progression.equipped?.hero ?? null,
        [slot]: currentEquipped
      } 
    };
    
    onUpdateProgression(next);
  };

  // Calculate stats from equipment
  const getEquipmentBonus = () => {
    const bonus = { attack: 0, defense: 0, maxHp: 0 };
    if (progression.equipped) {
      Object.values(progression.equipped).forEach(itemId => {
        if (!itemId) return;
        const item = ALL_SHOP_ITEMS.find(i => i.id === itemId);
        if (item) {
          bonus.attack += item.bonus.attack || 0;
          bonus.defense += item.bonus.defense || 0;
          bonus.maxHp += item.bonus.maxHp || 0;
        }
      });
    }
    return bonus;
  };

  const equipBonus = getEquipmentBonus();

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center sm:p-4 p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-4xl h-full sm:h-[85vh] bg-white dark:bg-slate-950 sm:rounded-[2.5rem] shadow-2xl border-t-4 sm:border-2 border-amber-500 overflow-hidden flex flex-col"
      >
        {/* Header Section */}
        <div className="flex-none p-4 sm:p-8 border-b border-amber-500/10 bg-amber-500/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-from)_0%,_transparent_50%)] from-amber-500"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-600 flex items-center gap-2 mb-1">
                <Hammer className="w-3 h-3" />
                The Legendary Forge
              </h3>
              <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">
                {activeTab === 'upgrades' ? 'STAT FORGING' 
                : activeTab === 'gear' ? 'GEAR ARMORY' 
                : activeTab === 'heroes' ? 'HERO CONTRACTS' 
                : 'YOUR ARTIFACTS'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border-2 border-amber-500/30 shadow-lg shadow-amber-500/10 flex items-center gap-3">
                <span className="text-xl">🪙</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight">{progression.totalCoins}</span>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                <X className="w-8 h-8 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 mt-6">
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400">Total HP</span>
                <span className="text-sm font-black dark:text-white">{progression.stats.maxHp + equipBonus.maxHp}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Sword className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400">Power</span>
                <span className="text-sm font-black dark:text-white">{progression.stats.attack + equipBonus.attack}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400">Defense</span>
                <span className="text-sm font-black dark:text-white">{progression.stats.defense + equipBonus.defense}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex-none flex items-center p-2 sm:p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'upgrades', name: 'Upgrades', icon: ArrowUpCircle },
            { id: 'heroes', name: 'Heroes', icon: Sparkles },
            { id: 'gear', name: 'Armory', icon: ShoppingBag },
            { id: 'inventory', name: 'Satchel', icon: Package },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ShopTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'upgrades' && (
              <motion.div 
                key="upgrades"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {STAT_UPGRADES.map((upgrade) => {
                  const level = getUpgradeLevel(upgrade.id);
                  const cost = getUpgradeCost(upgrade.id, upgrade.baseCost, upgrade.growth);
                  const canAfford = progression.totalCoins >= cost;
                  const currentStat = (progression.stats as any)[upgrade.id];

                  return (
                    <div key={upgrade.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-white/5 hover:border-amber-500/30 transition-all flex flex-col group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform ${upgrade.color}`}>
                          <upgrade.icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black italic dark:text-white uppercase tracking-tight">{upgrade.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {level}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">{upgrade.desc}</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                          <span>Current</span>
                          <span className="text-slate-900 dark:text-white">{currentStat} {upgrade.unit}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-current ${upgrade.color}`} style={{ width: `${Math.min(100, level * 5)}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleStatUpgrade(upgrade.id, cost, upgrade.bonus)}
                          disabled={!canAfford}
                          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 border-b-4 transition-all ${
                            canAfford 
                              ? 'bg-amber-500 border-amber-700 text-white hover:translate-y-[-2px] active:translate-y-[2px] shadow-lg shadow-amber-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-widest">Build Up (+{upgrade.bonus})</span>
                          <span className="font-mono font-black">🪙{cost}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'gear' && (
              <motion.div 
                key="gear"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {GEAR_ITEMS.map((item) => {
                  const owned = progression.inventory.includes(item.id);
                  const canAfford = progression.totalCoins >= item.cost;
                  const rarityColor = item.rarity === 'legendary' ? 'text-amber-500' : item.rarity === 'epic' ? 'text-purple-500' : item.rarity === 'rare' ? 'text-blue-500' : 'text-slate-400';

                  return (
                    <div key={item.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-white/5 flex flex-col relative group overflow-hidden">
                      {owned && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">Owned</div>}
                      
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{item.icon}</span>
                        <div>
                          <h4 className="text-lg font-black italic dark:text-white leading-tight uppercase tracking-tight">{item.name}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${rarityColor}`}>{item.rarity} {item.type}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-grow italic">"{item.desc}"</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(item.bonus).map(([stat, val]) => (
                          <div key={stat} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-slate-400">
                             <span className="text-slate-600 dark:text-white">+{val}</span> {stat}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => buyGear(item)}
                        disabled={owned || !canAfford}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 border-b-4 transition-all ${
                          owned 
                            ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed' 
                            : canAfford 
                              ? 'bg-amber-600 border-amber-800 text-white hover:translate-y-[-2px] active:translate-y-[2px] shadow-lg shadow-amber-600/20' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {owned ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">In Satchel</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-black uppercase tracking-widest">Buy 🪙{item.cost}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'heroes' && (
              <motion.div 
                key="heroes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {HERO_ITEMS.map((item) => {
                  const owned = progression.inventory.includes(item.id);
                  const canAfford = progression.totalCoins >= item.cost;
                  const rarityColor = item.rarity === 'legendary' ? 'text-amber-500' : item.rarity === 'epic' ? 'text-purple-500' : item.rarity === 'rare' ? 'text-blue-500' : 'text-slate-400';

                  return (
                    <div key={item.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-white/5 flex flex-col relative group overflow-hidden">
                      {owned && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">Owned</div>}
                      
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{item.icon}</span>
                        <div>
                          <h4 className="text-lg font-black italic dark:text-white leading-tight uppercase tracking-tight">{item.name}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${rarityColor}`}>{item.rarity} {item.type}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-grow italic">"{item.desc}"</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(item.bonus).map(([stat, val]) => (
                          <div key={stat} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-slate-400">
                             <span className="text-slate-600 dark:text-white">+{val}</span> {stat}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => buyGear(item)}
                        disabled={owned || !canAfford}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 border-b-4 transition-all ${
                          owned 
                            ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed' 
                            : canAfford 
                              ? 'bg-amber-600 border-amber-800 text-white hover:translate-y-[-2px] active:translate-y-[2px] shadow-lg shadow-amber-600/20' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {owned ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">In Roster</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-black uppercase tracking-widest">Recruit 🪙{item.cost}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {(progression.inventory || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Package className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                    <h3 className="text-xl font-black italic dark:text-white uppercase tracking-tight">Your satchel is empty</h3>
                    <p className="text-slate-500">Visit the Armory to buy some gear.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(progression.inventory || []).map(id => {
                      const item = ALL_SHOP_ITEMS.find(i => i.id === id);
                      if (!item) return null;
                      const isEquipped = progression.equipped && progression.equipped[item.type] === item.id;

                      return (
                        <div key={id} className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-4 ${
                          isEquipped 
                            ? 'bg-amber-500/10 border-amber-500 overflow-hidden relative' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5'
                        }`}>
                          {isEquipped && <div className="absolute top-0 right-0 p-1 bg-amber-500 text-white rounded-bl-xl"><Star size={10} fill="currentColor" /></div>}
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{item.icon}</span>
                            <div>
                              <h4 className="font-black italic uppercase tracking-tight dark:text-white">{item.name}</h4>
                              <div className="flex gap-2">
                                {Object.entries(item.bonus).map(([s, v]) => (
                                  <span key={s} className="text-[9px] font-black text-amber-600 dark:text-amber-400">+{v}{s.slice(0,1).toUpperCase()}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleEquip(item)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isEquipped 
                                ? 'bg-amber-500 text-white shadow-lg' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="flex-none p-4 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5">
           <Info className="w-3 h-3 text-slate-400" />
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Stats and gear persist across all exam runs</p>
        </div>
      </motion.div>
    </div>
  );
};
