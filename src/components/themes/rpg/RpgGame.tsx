import React, { useEffect, useRef } from 'react';
import './RpgStyle.css';
import { Question, RpgProgression } from '../../../types';
import { marked } from 'marked';
import { generateCreatureSpritesheet } from './pixelCreatures';

export interface RpgGameProps {
  questions: Question[];
  onFinish: (answers: Record<string, string>, wrongPartSelections?: Record<string, string>, questionSpentTimes?: Record<string, number>, goldEarned?: number) => void;
  onQuit?: () => void;
  rpgProgression?: RpgProgression;
  onUpdateProgression?: (prog: RpgProgression) => void;
}

export const RpgGame: React.FC<RpgGameProps> = ({ questions, onFinish, onQuit, rpgProgression, onUpdateProgression }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logicRef = useRef<any>({ initialized: false });
  const progressionRef = useRef(rpgProgression);

  // Keep progression ref up to date
  useEffect(() => {
    if (!logicRef.current.initialized) {
        progressionRef.current = rpgProgression;
        return;
    }
    
    // Compute old max HP
    const getHp = (prog: any) => {
        let hp = prog?.stats?.maxHp || 100;
        let equipHp = 0;
        if (prog?.equipped) {
            const gearMap: Record<string, { maxHp?: number }> = {
              'leather_tunic': { maxHp: 20 },
              'iron_plate': { maxHp: 50 },
              'lucky_charm': { maxHp: 15 },
              'dragon_scale': { maxHp: 100 }
            };
            Object.values(prog.equipped).forEach(id => {
                if (id && gearMap[id as string]) equipHp += gearMap[id as string].maxHp || 0;
            });
        }
        let dynamicHp = 0;
        if (prog?.dynamicEquipped) {
             Object.values(prog.dynamicEquipped).forEach((item: any) => {
                  if (item && item.mods && item.mods.maxHp) dynamicHp += item.mods.maxHp;
             });
        }
        return hp + equipHp + dynamicHp;
    };
    
    const oldMax = getHp(progressionRef.current);
    const newMax = getHp(rpgProgression);
    
    progressionRef.current = rpgProgression;
    
    if (newMax > oldMax && containerRef.current && logicRef.current.triggerRender) {
        const diff = newMax - oldMax;
        // Increase current HP if game is running
        const state = logicRef.current.state;
        if (state && state.player && state.player.hp > 0) {
            state.player.hp += diff;
        }
    }
    
    if (logicRef.current.triggerRender) {
      logicRef.current.triggerRender();
    }
  }, [rpgProgression]);

  useEffect(() => {
    if (!containerRef.current || logicRef.current.initialized) return;
    logicRef.current.initialized = true;

    const container = containerRef.current;
    
    // Scoped selectors
    const $ = (s: string) => container.querySelector(s) as HTMLElement;
    const $$ = (s: string) => Array.from(container.querySelectorAll(s)) as HTMLElement[];

    const slotMeta = {
      weapon: { label: "Weapon", icon: "🪄" },
      offhand: { label: "Offhand", icon: "🛡️" },
      armor: { label: "Armor", icon: "👕" },
      ring: { label: "Ring", icon: "💍" },
      boots: { label: "Boots", icon: "🥾" },
      charm: { label: "Charm", icon: "✨" }
    };

    const itemDefs = {
      starterWand: { type: "equip", slot: "weapon", name: "Starter Wand", icon: "🪄", desc: "+2 Atk", mods: { attack: 2 } },
      twigWand: { type: "equip", slot: "weapon", name: "Twig Wand", icon: "🪄", desc: "+3 Atk", mods: { attack: 3 } },
      barkBuckler: { type: "equip", slot: "offhand", name: "Bark Buckler", icon: "🛡️", desc: "+1 Armor", mods: { armor: 1 } },
      moonBoots: { type: "equip", slot: "boots", name: "Moon Boots", icon: "🥾", desc: "+6% Dodge", mods: { dodge: 0.06 } },
      rubyRing: { type: "equip", slot: "ring", name: "Ruby Ring", icon: "💍", desc: "+7% Crit", mods: { crit: 0.07 } },
      heartCharm: { type: "equip", slot: "charm", name: "Heart Charm", icon: "❤️", desc: "+16 HP", mods: { maxHp: 16 } },
      luckyLeaf: { type: "equip", slot: "charm", name: "Lucky Leaf", icon: "🍀", desc: "+1 Atk • +3% Crit • +0.5 Luck", mods: { attack: 1, crit: 0.03, luck: 0.5 } },
      lidShield: { type: "equip", slot: "offhand", name: "Lid Shield", icon: "🪵", desc: "+1 Armor", mods: { armor: 1 } },
      trollPebble: { type: "equip", slot: "charm", name: "Troll Pebble", icon: "🪨", desc: "+2 Atk", mods: { attack: 2 } },
      shrineBlessing: { type: "passive", name: "Shrine Blessing", icon: "🌙", desc: "+6% Crit", mods: { crit: 0.06 } },
      wolfPupFavor: { type: "passive", name: "Wolf Pup Favor", icon: "🐾", desc: "+5% Dodge", mods: { dodge: 0.05 } },
      frogTonic: { type: "passive", name: "Frog Tonic", icon: "🧪", desc: "+12 HP", mods: { maxHp: 12 } }
    };



    const spriteCache: Record<string, string> = {};
    function getSprite(type: string) {
      if (!spriteCache[type]) {
        spriteCache[type] = generateCreatureSpritesheet(type);
      }
      return spriteCache[type];
    }
    
    function renderPixelCharacterHTML(type: string, direction: "left" | "right" | "down", scale: number = 4) {
      const dataUrl = getSprite(type);
      return `<div class="PixelCharacter walk-${direction}" style="--pixel-size: ${scale}"><img src="${dataUrl}" class="PixelArtImage PixelCharacter_sprite" alt="${type}"/></div>`;
    }

    function updateSprite(el: HTMLElement | null, type: string, direction: "left" | "right" | "down", scale: number = 4) {
      if (!el) return;
      const html = renderPixelCharacterHTML(type, direction, scale);
      if (el.innerHTML !== html) el.innerHTML = html;
    }

    const sourceQuestions = [...questions];

    const eventDeck = [
      {
        prompt: "A lost lady asks for help.",
        promptCopy: "Choose what to do.",
        choices: { true: { title: "Help the lady.", copy: "Offer your help.", glyph: "🤝", badge: "Help" }, false: { title: "Walk away.", copy: "Keep moving.", glyph: "🍂", badge: "Pass" } },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            if (Math.random() < 0.72) { healPlayer(12); state.player.gold += 8; state.player.apples += 1; return "You help her. +12 HP, +8 gold, +1 apple."; }
            const lostGold = Math.min(state.player.gold, 12); state.player.gold -= lostGold; return `She steals ${lostGold} gold and vanishes.`;
          }
          return "You keep moving.";
        }
      },
      {
        prompt: "A chest glows in the dark.",
        promptCopy: "Choose what to do.",
        choices: { true: { title: "Open the chest.", copy: "Take the risk.", glyph: "🧰", badge: "Open" }, false: { title: "Leave the chest.", copy: "Walk past it.", glyph: "🍂", badge: "Leave" } },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            if (Math.random() < 0.55) { state.player.gold += 18; return "It was treasure. +18 gold."; }
            takePlayerDamage(10); return "It bites. -10 HP.";
          }
          addBackpackItem(itemDefs.lidShield); return "You take the lid. Lid Shield added.";
        }
      },
      {
        prompt: "A shrine hums softly.",
        promptCopy: "Choose what to do.",
        choices: {
          true: { title: "Bow to the shrine.", copy: "Show respect.", glyph: "🌙", badge: "Bow" },
          false: { title: "Ignore the shrine.", copy: "Keep your distance.", glyph: "🚶", badge: "Ignore" }
        },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            const tithe = Math.min(state.player.gold, 6);
            state.player.gold -= tithe;
            addPassive(itemDefs.shrineBlessing);
            return `You pay ${tithe} gold. Shrine Blessing gained.`;
          }
          takePlayerDamage(7);
          return "The shrine zaps you. -7 HP.";
        }
      },
      {
        prompt: "A wolf pup wants food.",
        promptCopy: "Choose what to do.",
        choices: {
          true: { title: "Feed the wolf pup.", copy: "Make a small offering.", glyph: "🐾", badge: "Feed" },
          false: { title: "Shoo the wolf pup.", copy: "Send it away.", glyph: "🍃", badge: "Shoo" }
        },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            const cost = Math.min(state.player.gold, 5); state.player.gold -= cost; addPassive(itemDefs.wolfPupFavor); return `You feed it for ${cost} gold. Pup Favor gained.`;
          }
          takePlayerDamage(6); return "It bites your ankle. -6 HP.";
        }
      },
      {
        prompt: "A troll demands bridge tax.",
        promptCopy: "Choose what to do.",
        choices: {
          true: { title: "Pay the troll tax.", copy: "Cross safely.", glyph: "🪙", badge: "Pay" },
          false: { title: "Bluff the troll.", copy: "Try your luck.", glyph: "🎭", badge: "Bluff" }
        },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            const tax = Math.min(state.player.gold, 7); state.player.gold -= tax; addBackpackItem(itemDefs.trollPebble); return `You pay ${tax} gold. Troll Pebble added.`;
          }
          if (Math.random() < 0.5) { state.player.gold += 10; return "Your bluff works. +10 gold."; }
          takePlayerDamage(9); return "The troll slams you. -9 HP.";
        }
      },
      {
        prompt: "A frog merchant offers a potion.",
        promptCopy: "Choose what to do.",
        choices: {
          true: { title: "Drink the potion.", copy: "Trust the frog merchant.", glyph: "🧪", badge: "Drink" },
          false: { title: "Refuse the potion.", copy: "Play it safe.", glyph: "🐸", badge: "Refuse" }
        },
        onChoose: (choice: boolean, state: any) => {
          if (choice) {
            if (Math.random() < 0.6) { addPassive(itemDefs.frogTonic); healPlayer(12); return "It works. Frog Tonic gained. +12 HP."; }
            const loss = Math.min(state.player.gold, 9); state.player.gold -= loss; return `Bad side effects. Lose ${loss} gold.`;
          }
          state.player.gold += 5; return "He pays you for being careful. +5 gold.";
        }
      }
    ];

    const shopPool = [
      { name: "Twig Wand", icon: "🪄", cost: 12, desc: "+3 Atk", onBuy() { addBackpackItem(itemDefs.twigWand); } },
      { name: "Bark Buckler", icon: "🛡️", cost: 11, desc: "+1 Armor", onBuy() { addBackpackItem(itemDefs.barkBuckler); } },
      { name: "Moon Boots", icon: "🥾", cost: 13, desc: "+6% Dodge", onBuy() { addBackpackItem(itemDefs.moonBoots); } },
      { name: "Ruby Ring", icon: "💍", cost: 14, desc: "+7% Crit", onBuy() { addBackpackItem(itemDefs.rubyRing); } },
      { name: "Apple Bundle", icon: "🍎", cost: 8, desc: "+2 Apples", onBuy() { state.player.apples += 2; } },
      { name: "Heart Charm", icon: "❤️", cost: 15, desc: "+16 HP", onBuy() { addBackpackItem(itemDefs.heartCharm); } },
      { name: "Lucky Leaf", icon: "🍀", cost: 10, desc: "+1 Atk • +3% Crit • +0.5 Luck", onBuy() { addBackpackItem(itemDefs.luckyLeaf); } }
    ];

    const els = {
      avatarBtn: $("#avatarBtn"),
      hudAvatar: $("#hudAvatar"),
      hudName: $("#hudName"),
      hudHp: $("#hudHp"),
      hudGold: $("#hudGold"),
      hudApples: $("#hudApples"),
      enemyMiniFill: $("#enemyMiniFill"),
      enemyMiniText: $("#enemyMiniText"),
      playerFighter: $("#playerFighter"),
      enemyFighter: $("#enemyFighter"),
      playerSprite: $("#playerSprite"),
      enemySprite: $("#enemySprite"),
      playerName: $("#playerName"),
      enemyName: $("#enemyName"),
      playerSlash: $("#playerSlash"),
      enemySlash: $("#enemySlash"),
      damageLayer: $("#damageLayer"),
      promptTitle: $("#promptTitle"),
      promptImage: $("#promptImage"),
      promptCopy: $("#promptCopy"),
      cardGrid: $("#cardGrid"),
      modalBackdrop: $("#modalBackdrop"),
      modalAvatar: $("#modalAvatar"),
      modalTitle: $("#modalTitle"),
      modalStats: $("#modalStats"),
      equipmentGrid: $("#equipmentGrid"),
      backpackGrid: $("#backpackGrid"),
      passiveGrid: $("#passiveGrid"),
      modalAppleBtn: $("#modalAppleBtn"),
      comboContainer: $("#comboContainer"),
      closeModalBtn: $("#closeModalBtn")
    };

    const recordedAnswers: Record<string, string> = {};
    const recordedWrongPartSelections: Record<string, string> = {};

    const state = {
      mode: "quiz",
      lock: false,
      modalOpen: false,
      revealRunning: false,
      hidePrompt: false,
      player: null as any,
      passives: [] as any[],
      enemyIndex: 0,
      enemyHp: 0,
      currentQuestion: null as any,
      currentEvent: null as any,
      currentShop: [] as any[],
      questionDeck: [] as any[],
      combo: 0,
      itemId: 0,
      pendingEnemyAdvance: false,
      lastMessage: "",
      multiSelectCurrent: new Set<string>(),
      enemies: [] as any[]
    };

    function shuffle(arr: any[]) {
      const clone = [...arr];
      for (let i = clone.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
      }
      return clone;
    }
    function pick(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
    function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
    function wait(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
    function makeItem(def: any) {
      return { id: ++state.itemId, type: def.type, slot: def.slot || null, name: def.name, icon: def.icon, desc: def.desc, mods: { ...(def.mods || {}) }, sellPrice: 0 };
    }
    function addBackpackItem(def: any) {
      const currProg = progressionRef.current;
      if (currProg && onUpdateProgression) {
         const newProg = { ...currProg, backpack: [...(currProg.backpack || [])] };
         const item = makeItem(def);
         item.sellPrice = def.cost ? Math.floor(def.cost * 0.5) : 5;
         newProg.backpack.unshift(item as any);
         onUpdateProgression(newProg);
      }
      renderAll();
    }
    function addPassive(def: any) {
      const exists = state.passives.some((passive) => passive.name === def.name);
      if (!exists) { state.passives.unshift(makeItem(def)); clampPlayerHp(); renderAll(); }
    }
    function getPlayerBuild() {
      const player = state.player;
      const prog = progressionRef.current;
      
      // Calculate meta equipment bonuses from progression (Global Shop gear)
      let metaEquipAtk = 0, metaEquipDef = 0, metaEquipHp = 0;
      if (prog?.equipped) {
        const gearMap: Record<string, { attack?: number, defense?: number, maxHp?: number }> = {
          'rusty_blade': { attack: 5 },
          'shadow_dagger': { attack: 15 },
          'leather_tunic': { defense: 4, maxHp: 20 },
          'iron_plate': { defense: 12, maxHp: 50 },
          'lucky_charm': { maxHp: 15, attack: 2 },
          'dragon_scale': { defense: 8, attack: 8, maxHp: 100 }
        };
        Object.values(prog.equipped).forEach(id => {
          if (id && gearMap[id as string]) {
            metaEquipAtk += gearMap[id as string].attack || 0;
            metaEquipDef += gearMap[id as string].defense || 0;
            metaEquipHp += gearMap[id as string].maxHp || 0;
          }
        });
      }

      // Base stats combine: meta stats + meta gear
      let attack = (prog?.stats?.attack || 8) + metaEquipAtk; 
      let armor = (prog?.stats?.defense || 0) + metaEquipDef; 
      let crit = player.baseCrit; 
      let dodge = player.baseDodge; 
      let maxHp = (prog?.stats?.maxHp || 100) + metaEquipHp;

      const equipment = Object.values(prog?.dynamicEquipped || {}).filter(Boolean);
      const all = equipment.concat(state.passives);
      let luck = 0;
      all.forEach((item: any) => { 
        attack += item.mods.attack || 0; 
        armor += item.mods.armor || 0; 
        crit += item.mods.crit || 0; 
        dodge += item.mods.dodge || 0; 
        maxHp += item.mods.maxHp || 0; 
        luck += item.mods.luck || 0;
      });
      return { attack, armor, crit, dodge, maxHp, luck };
    }
    function clampPlayerHp() { const build = getPlayerBuild(); state.player.hp = Math.min(state.player.hp, build.maxHp); }
    function healPlayer(amount: number) { const build = getPlayerBuild(); state.player.hp = Math.min(build.maxHp, state.player.hp + amount); }
    function takePlayerDamage(amount: number) { state.player.hp = Math.max(0, state.player.hp - amount); }
    function formatMods(mods: any) {
      const parts = [];
      if (mods.attack) parts.push(`+${mods.attack} Atk`);
      if (mods.armor) parts.push(`+${mods.armor} Armor`);
      if (mods.luck) parts.push(`+${mods.luck.toFixed(1)} Luck`);
      if (mods.crit) parts.push(`+${Math.round(mods.crit * 100)}% Crit`);
      if (mods.dodge) parts.push(`+${Math.round(mods.dodge * 100)}% Dodge`);
      if (mods.maxHp) parts.push(`+${mods.maxHp} HP`);
      return parts.join(" • ") || "No bonus";
    }

    function openModal() { state.modalOpen = true; els.modalBackdrop.hidden = false; renderModal(); }
    function closeModal() { state.modalOpen = false; els.modalBackdrop.hidden = true; }
    function sellBackpackItem(itemId: string, event: Event) {
      event.stopPropagation();
      const currProg = progressionRef.current;
      if (!currProg || !onUpdateProgression) return;
      
      const newProg = { ...currProg, backpack: [...(currProg.backpack || [])] };
      const idx = newProg.backpack.findIndex(i => String(i.id) === String(itemId));
      if (idx > -1) {
          const item = newProg.backpack[idx];
          newProg.backpack.splice(idx, 1);
          newProg.totalCoins += item.sellPrice || 10;
          state.player.gold += item.sellPrice || 10;
          onUpdateProgression(newProg);
          renderAll();
      }
    }

    function equipBackpackItem(itemId: string) {
      const currProg = progressionRef.current;
      if (!currProg || !onUpdateProgression) return;
      
      const newProg = { ...currProg, backpack: [...(currProg.backpack || [])], dynamicEquipped: { ...(currProg.dynamicEquipped || { weapon: null, offhand: null, armor: null, boots: null, ring: null, charm: null }) } as RpgProgression["dynamicEquipped"] };
      
      const itemIdx = newProg.backpack.findIndex(i => String(i.id) === String(itemId));
      if (itemIdx === -1) return;
      
      const item = newProg.backpack[itemIdx];
      const slot = item.slot;
      const currentEquipped = newProg.dynamicEquipped![slot];
      
      newProg.backpack.splice(itemIdx, 1);
      if (currentEquipped) {
         newProg.backpack.unshift(currentEquipped);
      }
      newProg.dynamicEquipped![slot] = item;
      
      onUpdateProgression(newProg);
      // Let the component re-render so progressionRef.current updates
      setTimeout(() => { clampPlayerHp(); renderAll(); }, 50);
    }
    
    function unequipSlot(slot: "weapon" | "offhand" | "armor" | "boots" | "ring" | "charm") {
      const currProg = progressionRef.current;
      if (!currProg || !onUpdateProgression) return;
      
      const newProg = { ...currProg, backpack: [...(currProg.backpack || [])], dynamicEquipped: { ...(currProg.dynamicEquipped || { weapon: null, offhand: null, armor: null, boots: null, ring: null, charm: null }) } as RpgProgression["dynamicEquipped"] };
      
      const item = newProg.dynamicEquipped![slot];
      if (!item) return;
      
      newProg.dynamicEquipped![slot] = null;
      newProg.backpack.unshift(item);
      
      onUpdateProgression(newProg);
      setTimeout(() => { clampPlayerHp(); renderAll(); }, 50);
    }
    
    function eatApple() {
      if (state.player.apples <= 0 || state.mode === "gameover" || state.mode === "victory") return;
      state.player.apples -= 1; healPlayer(18); updateBanner("Apple eaten. +18 HP."); renderAll();
    }
    function setEnemy(enemy: any, immediate = false) {
      els.enemyName.textContent = enemy.name;
      updateSprite(els.enemySprite, enemy.type, "left", 2.2);
      els.enemyFighter.classList.remove("defeated", "entering", "show", "hit", "attacking");
      if (!immediate) {
        els.enemyFighter.classList.add("entering");
        requestAnimationFrame(() => { requestAnimationFrame(() => { els.enemyFighter.classList.add("show"); }); });
      }
    }
    function updateBanner(text: string) {
      state.lastMessage = text;
      if (!state.hidePrompt && !state.revealRunning) els.promptCopy.textContent = text;
    }
    function setCardGridMode(mode = "default") { els.cardGrid.className = mode === "two" ? "card-grid two-card" : "card-grid"; }

    function renderHud() {
      const build = getPlayerBuild();
      updateSprite(els.hudAvatar, state.player.type, "down", 1.2);
      els.hudName.textContent = state.player.name;
      updateSprite(els.playerSprite, state.player.type, "right", 2.2);
      els.playerName.textContent = state.player.name;
      els.hudHp.textContent = `${state.player.hp} / ${build.maxHp}`;
      els.hudGold.textContent = String(state.player.gold);
      els.hudApples.textContent = String(state.player.apples);

      // Render Combo UI
      if (els.comboContainer) {
        if (state.combo >= 2) {
          const mult = Math.floor(state.combo / 5) + 1;
          els.comboContainer.innerHTML = `
            <div class="combo-badge ${mult > 1 ? 'combo-multiplier-active' : ''}">
              <div class="combo-num">${state.combo}</div>
              <div class="combo-txt">STREAK</div>
              ${mult > 1 ? `<div class="combo-x">${mult}x DMG</div>` : ''}
            </div>
          `;
          els.comboContainer.classList.add('active');
        } else {
          els.comboContainer.innerHTML = "";
          els.comboContainer.classList.remove('active');
        }
      }
    }
    function renderScene() {
      const enemy = state.enemies[state.enemyIndex];
      const enemyPct = (state.enemyHp / enemy.hp) * 100;
      els.enemyMiniFill.style.width = `${clamp(enemyPct, 0, 100)}%`;
      if (els.enemyMiniText) {
        els.enemyMiniText.textContent = `${Math.ceil(state.enemyHp)} / ${enemy.hp}`;
      }
      updateSprite(els.enemySprite, enemy.type, "left", 2.2);
      els.enemyName.textContent = enemy.name;
    }

    function renderPrompt() {
      if (state.revealRunning || state.hidePrompt) return;
      const mode = state.mode;

      if (mode === "quiz") {
        if (!state.currentQuestion) { els.cardGrid.innerHTML = ""; return; }
        const q = state.currentQuestion as Question;
        let html = marked.parse(q.question) as string;
        // Support for ==highlight== or ::term::
        html = html.replace(/==([^:=]+)==/g, '<mark>$1</mark>');
        html = html.replace(/::([^:=]+)::/g, '<span class="term">$1</span>');
        els.promptTitle.innerHTML = html;
        
        const img = q.imageUrl || (q as any).image;
        if (img) {
          els.promptImage.innerHTML = `<img src="${img}" alt="Question Image" class="rpg-question-image" referrerPolicy="no-referrer" />`;
          els.promptImage.style.display = "flex";
        } else {
          els.promptImage.innerHTML = "";
          els.promptImage.style.display = "none";
        }
        
        let cards = [];

        if (q.type === 'mcq') {
          els.promptCopy.textContent = "Select the correct answer to attack.";
          setCardGridMode("default");
          
          cards = (q.options || []).map((opt, i) => createAnswerCard({
            value: String(i),
            tag: String.fromCharCode(65 + i),
            title: opt,
            copy: "",
            glyph: ["A", "B", "C", "D", "E", "F"][i] || "",
            layout: "default",
            hideTag: false
          }));
        } else if (q.type === 'multi_select') {
          els.promptCopy.textContent = "Select all correct answers, then Confirm Attack.";
          setCardGridMode("default");
          state.multiSelectCurrent.clear();
          
          cards = (q.options || []).map((opt, i) => createAnswerCard({
            value: String(i),
            tag: "▢",
            title: opt,
            copy: "",
            glyph: ["A", "B", "C", "D", "E", "F"][i] || "",
            layout: "default",
            hideTag: false
          }));

          cards.push(
            `<div style="grid-column: 1 / -1; display: flex; justify-content: center; width: 100%; margin-top: 10px;">
              <button class="play-card true-card card-pre-enter" type="button" id="multiSelectConfirmBtn" style="--tilt:0deg; aspect-ratio: auto; min-height: 80px; max-width: 320px; align-items: center; justify-content: center; display: flex; flex-direction: column; opacity: 0.5; pointer-events: none;">
                <div class="play-card-shine"></div>
                <div class="card-body" style="justify-content: center; align-items: center; text-align: center;">
                  <h4 class="card-title" style="margin-top: 0; font-size: 1.1rem;">Confirm Attack</h4>
                </div>
                <canvas class="burn-canvas"></canvas>
              </button>
            </div>`
          );
        } else {
          // True/False
          els.promptCopy.textContent = "Pick true or false.";
          setCardGridMode("two");
          cards = [
            createAnswerCard({ value: "True", tag: "", title: "TRUE", copy: "Trust it", glyph: "✔", layout: "default", hideTag: true }),
            createAnswerCard({ value: "False", tag: "", title: "FALSE", copy: "Call bluff", glyph: "✖", layout: "default", hideTag: true })
          ];
        }

        els.cardGrid.innerHTML = cards.join("");
        paintAnswerCardCanvases();
        attachAnswerHandlers();
        animateFreshCards();
        return;
      }

      if (mode === "event") {
        const e = state.currentEvent;
        els.promptImage.style.display = "none";
        els.promptTitle.textContent = e.prompt;
        els.promptCopy.textContent = e.promptCopy || "Choose what to do.";
        const yesChoice = e.choices.true; const noChoice = e.choices.false;
        setCardGridMode("two");
        const cards = [
          createAnswerCard({ value: "true", tag: "", title: yesChoice.title, copy: yesChoice.copy, glyph: yesChoice.glyph, layout: "event", hideTag: true }),
          createAnswerCard({ value: "false", tag: "", title: noChoice.title, copy: noChoice.copy, glyph: noChoice.glyph, layout: "event", hideTag: true })
        ];
        els.cardGrid.innerHTML = cards.join("");
        paintAnswerCardCanvases(); attachEventHandlers(); animateFreshCards(); return;
      }

      if (mode === "shop") {
        els.promptImage.style.display = "none";
        els.promptTitle.textContent = "A wandering merchant appears.";
        els.promptCopy.textContent = state.lastMessage || "Buy gear, apples, or leave.";
        setCardGridMode();
        const cards = state.currentShop.map((item: any, index: number) => createShopCard(item, index)).concat(createLeaveCard());
        els.cardGrid.innerHTML = cards.join("");
        attachShopHandlers(); animateFreshCards(); return;
      }

      if (mode === "gameover") {
        els.promptImage.style.display = "none";
        els.promptTitle.textContent = "The forest wins this round.";
        els.promptCopy.textContent = `You reached enemy ${state.enemyIndex + 1} of ${state.enemies.length}. ${state.player.gold} gold goes to your Forge.`;
        setCardGridMode("default");
        els.cardGrid.innerHTML = `<div style="grid-column: 1 / -1; display: flex; justify-content: center; width: 100%;"><button class="play-card true-card card-pre-enter finish-exam-card" type="button" id="endRunBtn" style="--tilt:0deg; aspect-ratio: auto; min-height: 120px; max-width: 320px; align-items: center; justify-content: center; display: flex; flex-direction: column;">
          <div class="play-card-ornament tl"></div><div class="play-card-ornament tr"></div><div class="play-card-ornament bl"></div><div class="play-card-ornament br"></div>
          <div class="play-card-shine"></div>
          <div class="card-body" style="justify-content: center; align-items: center; text-align: center;">
            <h4 class="card-title" style="margin-top: 0;">Finish Exam</h4>
            <p class="card-copy">Submit answers.</p>
          </div>
        </button></div>`;
        $("#endRunBtn").addEventListener("click", () => onFinish(recordedAnswers, recordedWrongPartSelections, undefined, state.player.gold));
        animateFreshCards(); return;
      }

      if (mode === "victory") {
        els.promptImage.style.display = "none";
        els.promptTitle.textContent = "You cleared the Forest of Fate.";
        els.promptCopy.textContent = `You survived with ${state.player.hp} HP and ${state.player.gold} gold. This gold goes to your Forge!`;
        setCardGridMode("default");
        els.cardGrid.innerHTML = `<div style="grid-column: 1 / -1; display: flex; justify-content: center; width: 100%;"><button class="play-card true-card card-pre-enter finish-exam-card" type="button" id="endRunBtn" style="--tilt:0deg; aspect-ratio: auto; min-height: 120px; max-width: 320px; align-items: center; justify-content: center; display: flex; flex-direction: column;">
          <div class="play-card-ornament tl"></div><div class="play-card-ornament tr"></div><div class="play-card-ornament bl"></div><div class="play-card-ornament br"></div>
          <div class="play-card-shine"></div>
          <div class="card-body" style="justify-content: center; align-items: center; text-align: center;">
            <h4 class="card-title" style="margin-top: 0;">Finish Exam</h4>
            <p class="card-copy">Submit answers.</p>
          </div>
        </button></div>`;
        $("#endRunBtn").addEventListener("click", () => onFinish(recordedAnswers, recordedWrongPartSelections, undefined, state.player.gold));
        animateFreshCards(); return;
      }
    }

    function renderModal() {
      if (!state.modalOpen) return;
      const build = getPlayerBuild();
      updateSprite(els.modalAvatar, state.player.type, "down", 1.5);
      els.modalTitle.textContent = state.player.name;
      els.modalAppleBtn.textContent = state.player.apples > 0 ? `Eat Apple (+18 HP) • ${state.player.apples}` : "No Apples";
      (els.modalAppleBtn as HTMLButtonElement).disabled = state.player.apples <= 0;
      els.modalAppleBtn.style.opacity = state.player.apples > 0 ? "1" : "0.5";
      const comboLuck = (state.combo / 10);
      els.modalStats.innerHTML = `<div class="stat-box"><div class="stat-label">HP</div><div class="stat-value">${state.player.hp} / ${build.maxHp}</div></div>
        <div class="stat-box"><div class="stat-label">Attack</div><div class="stat-value">${build.attack}</div></div>
        <div class="stat-box"><div class="stat-label">Armor</div><div class="stat-value">${build.armor}</div></div>
        <div class="stat-box"><div class="stat-label">Luck</div><div class="stat-value">${(build.luck + comboLuck).toFixed(1)}</div></div>
        <div class="stat-box"><div class="stat-label">Crit</div><div class="stat-value">${Math.round(build.crit * 100)}%</div></div>
        <div class="stat-box"><div class="stat-label">Dodge</div><div class="stat-value">${Math.round(build.dodge * 100)}%</div></div>`;
      
      els.equipmentGrid.innerHTML = Object.entries(slotMeta).map(([slot, meta]) => {
        const prog = progressionRef.current;
        const item = prog?.dynamicEquipped ? (prog.dynamicEquipped as any)[slot] : null;
        if (!item) return `<button class="equip-slot empty" type="button" data-slot="${slot}"><div class="slot-label">${meta.icon} ${meta.label}</div><div class="slot-main">Empty</div><div class="slot-desc">Tap backpack gear to equip.</div></button>`;
        const rarityColor = item.rarityColor || '#ffffff';
        const rarityClass = `rarity-${(item.rarityId || 'common').toLowerCase()}`;
        return `<button class="equip-slot ${rarityClass}" type="button" data-slot="${slot}" style="border-color: ${rarityColor}44; --rarity-color: ${rarityColor}">
          <div class="slot-label" style="color: ${rarityColor}">${meta.icon} ${item.rarityName || 'Common'} ${meta.label}</div>
          <div class="slot-main" style="color: ${rarityColor}">${item.icon} ${item.name}</div>
          <div class="slot-desc">${formatMods(item.mods)}<br>Tap to unequip.</div>
        </button>`;
      }).join("");
      
      const bp = progressionRef.current?.backpack || [];
      if (!bp.length) els.backpackGrid.innerHTML = `<div class="empty-note">Backpack empty.</div>`;
      else els.backpackGrid.innerHTML = bp.map((item: any) => {
        const meta = (slotMeta as any)[item.slot] || { label: "Misc", icon: "📦" };
        const rarityColor = item.rarityColor || '#ffffff';
        const rarityClass = `rarity-${(item.rarityId || 'common').toLowerCase()}`;
        return `<button class="bag-item ${rarityClass}" type="button" data-item-id="${item.id}" style="border-color: ${rarityColor}33; --rarity-color: ${rarityColor}">
          <div class="item-action" style="color: ${rarityColor}">${item.rarityName || 'Common'} ${meta.label}</div>
          <div class="item-main" style="color: ${rarityColor}">${item.icon || "✨"} ${item.name}</div>
          <div class="item-desc" style="color: ${rarityColor}cc">${formatMods(item.mods)}<br>Tap to equip.<br><span class="sell-btn" data-sell-id="${item.id}" style="padding:4px 8px;background:rgba(255,255,255,0.1);border-radius:4px;display:inline-block;margin-top:6px;color:#fff">Sell for ${item.sellPrice || 10}g</span></div>
        </button>`;
      }).join("");
      
      if (!state.passives.length) els.passiveGrid.innerHTML = `<div class="empty-note">No blessings yet.</div>`;
      else els.passiveGrid.innerHTML = state.passives.map((item: any) => `<div class="bag-item" style="cursor:default;"><div class="item-action">Passive</div><div class="item-main">${item.icon} ${item.name}</div><div class="item-desc">${formatMods(item.mods)}</div></div>`).join("");
      
      els.equipmentGrid.querySelectorAll("[data-slot]").forEach((btn) => btn.addEventListener("click", () => {
        const slot = (btn as HTMLElement).dataset.slot!;
        const item = progressionRef.current?.dynamicEquipped ? (progressionRef.current.dynamicEquipped as any)[slot] : null;
        if (item) unequipSlot(slot as any);
      }));
      els.backpackGrid.querySelectorAll("[data-item-id]").forEach((btn) => btn.addEventListener("click", () => equipBackpackItem((btn as HTMLElement).dataset.itemId!)));
      
      els.backpackGrid.querySelectorAll(".sell-btn").forEach((btn) => btn.addEventListener("click", (e) => {
        const itemId = (btn as HTMLElement).dataset.sellId!;
        sellBackpackItem(itemId, e);
      }));
    }

    function renderAll() { clampPlayerHp(); renderHud(); renderScene(); renderPrompt(); renderModal(); }
    logicRef.current.triggerRender = renderAll;
    function refreshUiPanels() { clampPlayerHp(); renderHud(); renderScene(); renderModal(); }

    function nextQuestion(shouldRender = true) {
      if (state.player.hp <= 0) { gameOver(); return; }
      state.mode = "quiz"; state.currentEvent = null; state.hidePrompt = false;
      
      if (state.questionDeck.length === 0) {
        victory();
        return;
      }
      
      state.currentQuestion = state.questionDeck.shift();
      if (shouldRender) renderPrompt();
    }

    function openEvent() { state.mode = "event"; state.currentEvent = pick(eventDeck); state.hidePrompt = false; updateBanner("A strange encounter appears."); renderPrompt(); }
    function openShop() { state.mode = "shop"; state.currentShop = shuffle(shopPool).slice(0, 3); state.hidePrompt = false; state.lastMessage = "Buy gear, apples, or leave."; renderPrompt(); }
    function maybeEncounter() { if (Math.random() < 0.32) { openShop(); return true; } if (Math.random() < 0.68) { openEvent(); return true; } return false; }
    
    function continueRunFlow() {
      if (state.player.hp <= 0) { gameOver(); return; }
      if (state.pendingEnemyAdvance) { advanceToNextEnemy(); return; }
      state.lock = false; nextQuestion();
    }
    
    function advanceToNextEnemy() {
      if (state.enemyIndex >= state.enemies.length - 1) { /* Just stay on last enemy or cycle */ state.enemyIndex = state.enemies.length - 1; }
      else { state.enemyIndex += 1; }
      state.pendingEnemyAdvance = false; state.lock = true; state.mode = "quiz"; state.currentEvent = null; state.currentShop = []; state.currentQuestion = null; state.hidePrompt = true;
      state.enemyHp = state.enemies[state.enemyIndex].hp; setEnemy(state.enemies[state.enemyIndex]); refreshUiPanels();
      setTimeout(() => { if (state.mode === "gameover" || state.mode === "victory") return; state.lock = false; nextQuestion(); }, 640);
    }

    function createAnswerCard({ value, tag = "", title = "", copy = "", glyph = "", layout = "default", hideTag = false }: any) {
      const classes = layout === "event" ? (value === "true" ? "true-card" : "false-card") : "true-card";
      const tilt = `${(Math.random() * 6 - 3).toFixed(2)}deg`;
      return `<button class="play-card ${classes} answer-canvas-card card-pre-enter" type="button" data-answer="${value}" data-tag="${tag}" data-title="${title?.replace(/"/g, '&quot;')}" data-copy="${copy}" data-glyph="${glyph}" data-layout="${layout}" data-hide-tag="${hideTag}" style="--tilt:${tilt};">
        <div class="play-card-ornament tl"></div><div class="play-card-ornament tr"></div><div class="play-card-ornament bl"></div><div class="play-card-ornament br"></div>
        <div class="play-card-shine"></div>
        <div class="card-sparkle" style="--x:15%; --y:15%;"></div><div class="card-sparkle" style="--x:85%; --y:85%;"></div>
        <div class="answer-flip"><div class="answer-face answer-front-face"><canvas class="answer-front" width="380" height="532"></canvas></div><div class="answer-face answer-back-face"><div class="answer-back-pattern"></div><canvas class="answer-back-canvas" width="380" height="532"></canvas></div></div><canvas class="burn-canvas" width="380" height="532"></canvas></button>`;
    }

    function createShopCard(item: any, index: number) { const tilt = `${(Math.random() * 6 - 3).toFixed(2)}deg`; return `<button class="play-card true-card card-pre-enter" type="button" data-shop-index="${index}" style="--tilt:${tilt};"><div class="play-card-ornament tl"></div><div class="play-card-ornament tr"></div><div class="play-card-ornament bl"></div><div class="play-card-ornament br"></div><div class="play-card-shine"></div><span class="card-corner">${item.icon}</span><span class="card-corner bottom">${item.icon}</span><span class="card-glyph">${item.icon}</span><div class="card-body"><span class="card-tag">Shop</span><h4 class="card-title">${item.name}</h4><p class="card-copy">${item.desc}</p><span class="card-price">🪙 ${item.cost}</span></div></button>`; }
    function createLeaveCard() { return `<button class="play-card false-card card-pre-enter" type="button" data-shop-index="leave" style="--tilt:0deg;"><div class="play-card-ornament tl"></div><div class="play-card-ornament tr"></div><div class="play-card-ornament bl"></div><div class="play-card-ornament br"></div><div class="play-card-shine"></div><span class="card-corner">🚪</span><span class="card-corner bottom">🚪</span><span class="card-glyph">🍂</span><div class="card-body"><span class="card-tag">Leave</span><h4 class="card-title">Leave Shop</h4><p class="card-copy">Save your gold.</p></div></button>`; }

    function attachAnswerHandlers() {
      $$("[data-answer]").forEach((btn) => {
        setupCardTilt(btn);
        btn.addEventListener("click", () => {
          if (state.lock || state.mode !== "quiz") return;
          const q = state.currentQuestion;
          
          if (q.type === 'multi_select') {
            const val = btn.dataset.answer!;
            const isSelected = state.multiSelectCurrent.has(val);
            if (isSelected) {
              state.multiSelectCurrent.delete(val);
              btn.classList.remove('multi-selected');
              btn.style.boxShadow = "";
              btn.style.transform = "scale(1)";
              const canvas = btn.querySelector(".answer-front") as HTMLCanvasElement;
              if (canvas) {
                drawAnswerCardFace(canvas, { 
                  truthy: true, 
                  tag: btn.dataset.tag || "", 
                  title: btn.dataset.title || "", 
                  glyph: btn.dataset.glyph || "", 
                  layout: btn.dataset.layout || "default",
                  tone: "default"
                });
              }
            } else {
              state.multiSelectCurrent.add(val);
              btn.classList.add('multi-selected');
              btn.style.transform = "scale(0.95)";
              const canvas = btn.querySelector(".answer-front") as HTMLCanvasElement;
              if (canvas) {
                drawAnswerCardFace(canvas, { 
                  truthy: true, 
                  tag: btn.dataset.tag || "", 
                  title: btn.dataset.title || "", 
                  glyph: btn.dataset.glyph || "", 
                  layout: btn.dataset.layout || "default",
                  tone: "silver"
                });
              }
            }
            
            const confirmBtn = document.getElementById("multiSelectConfirmBtn");
            if (confirmBtn) {
               if (state.multiSelectCurrent.size > 0) {
                 confirmBtn.style.opacity = "1";
                 confirmBtn.style.pointerEvents = "auto";
                 confirmBtn.classList.add("pulse-ready");
                 confirmBtn.style.boxShadow = ""; // Clear inline so class animation works
               } else {
                 confirmBtn.style.opacity = "0.5";
                 confirmBtn.style.pointerEvents = "none";
                 confirmBtn.classList.remove("pulse-ready");
                 confirmBtn.style.boxShadow = "";
               }
            }
          } else {
            const val = btn.dataset.answer!;
            resolveQuestion(val, btn);
          }
        });
      });

      const confirmBtn = document.getElementById("multiSelectConfirmBtn");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          if (state.lock || state.mode !== "quiz" || state.multiSelectCurrent.size === 0) return;
          const q = state.currentQuestion;
          const selectedIndices = Array.from(state.multiSelectCurrent).map(Number).sort((a,b)=>a-b);
          const selectedValues = selectedIndices.map(i => q.options[i]).join("|");
          resolveQuestion(selectedValues, confirmBtn); 
        });
      }
    }

    function attachEventHandlers() { $$("[data-answer]").forEach((btn) => { setupCardTilt(btn); btn.addEventListener("click", () => { if (state.lock || state.mode !== "event") return; resolveEvent(btn.dataset.answer === "true", btn); }); }); }
    function attachShopHandlers() { $$("[data-shop-index]").forEach((btn) => { setupCardTilt(btn); btn.addEventListener("click", () => { if (state.lock || state.mode !== "shop") return; const val = btn.dataset.shopIndex!; if (val === "leave") { state.lastMessage = "You leave the shop."; continueRunFlow(); return; } buyItem(state.currentShop[Number(val)]); }); }); }

    function setupCardTilt(btn: any) {
      btn.addEventListener("mousemove", (e: MouseEvent) => {
        if (btn.classList.contains("floating-card")) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        btn.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      });
      btn.addEventListener("mouseleave", () => {
        if (btn.classList.contains("floating-card")) return;
        btn.style.transform = "";
      });
    }

    async function showCorrectAnswer(q: Question) {
      if (!els.cardGrid) return;
      
      // Inform the player via the prompt area
      els.promptTitle.textContent = "Correct Answer";
      els.promptCopy.textContent = "Study the scroll of wisdom...";
      
      els.cardGrid.innerHTML = "";
      els.cardGrid.style.display = "flex";
      els.cardGrid.style.justifyContent = "center";
      els.cardGrid.style.alignItems = "center";
      els.cardGrid.style.minHeight = "360px"; 

      const cardHtml = createAnswerCard({
        value: "", tag: "Oracle", title: "Scroll", copy: "", glyph: "📜", layout: "default", hideTag: true
      });
      
      // Place in grid to establish a starting rectangle for the float animation
      els.cardGrid.innerHTML = `<div style="width: 240px; height: 340px; display: flex; justify-items: center; align-items: center;">${cardHtml}</div>`;
      
      const cardBtn = els.cardGrid.querySelector(".play-card") as HTMLElement;
      cardBtn.classList.remove("card-pre-enter"); // Skip entry delay as we are about to float it
      cardBtn.classList.add("card-legendary"); // Apply unique golden glow
      
      // Setup the faces
      const frontCanvas = cardBtn.querySelector(".answer-front") as HTMLCanvasElement;
      drawAnswerCardFace(frontCanvas, { 
        truthy: true, 
        tag: "Oracle", 
        title: "Hidden Truth", 
        glyph: "📜", 
        layout: "default",
        isLegendary: true
      });
      
      // Draw the solution on the back face
      let copyText = (q.type === 'multi_select') ? (q.correctAnswers || []).join(", ") : q.correctAnswer;
      if (q.type === 'true_false' && q.correctAnswer === 'False' && q.wrongPart) {
        copyText = `False! ${q.wrongPart}`;
      }

      setResultFace(cardBtn, { 
        title: "The Truth", 
        copy: copyText, 
        tone: "legendary", 
        glyph: "📜" 
      });

      // Execute the high-quality reveal animation
      // This floats the card from the grid to the center of the viewport
      await floatAndFlipCard(cardBtn, 400);
      
      await wait(5000); // More time to study the legendary correction

      // Standard cleanup: burn the card and reset states
      await finishAnswerReveal(cardBtn);
      
      // Reset cardGrid styles
      els.cardGrid.style.display = "";
      els.cardGrid.style.justifyContent = "";
      els.cardGrid.style.alignItems = "";
      els.cardGrid.style.minHeight = "";
    }

    async function resolveQuestion(guessVal: string, button: HTMLElement) {
      state.lock = true; state.revealRunning = true; state.hidePrompt = true;
      const q = state.currentQuestion;
      
      let isCorrect = false;
      if (q.type === 'mcq') {
         isCorrect = ((q.options || [])[Number(guessVal)] === q.correctAnswer);
      } else if (q.type === 'multi_select') {
         const selected = guessVal.split("|").filter(Boolean).sort();
         const correct = (q.correctAnswers || []).slice().sort();
         isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
      } else {
         isCorrect = (guessVal === q.correctAnswer);
      }
        
      recordedAnswers[q.id] = (q.type === 'mcq') ? (q.options || [])[Number(guessVal)] : guessVal;

      // Special handling for True/False in RPG mode
      if (q.type === 'true_false' && guessVal === 'False' && q.correctAnswer === 'False' && q.wrongPart) {
        recordedWrongPartSelections[q.id] = q.wrongPart;
      }

      if (q.type === 'multi_select') {
        const selectedSet = new Set(guessVal.split("|").filter(Boolean));
        const allAnswerBtns = $$("[data-answer]");
        const selectedBtns = allAnswerBtns.filter(b => selectedSet.has((q.options || [])[Number(b.dataset.answer!)]));
        const unselectedBtns = allAnswerBtns.filter(b => !selectedSet.has((q.options || [])[Number(b.dataset.answer!)]));
        
        // 1. Burn unselected buttons and the confirm button wrapper immediately
        unselectedBtns.forEach(b => burnAwayCard(b, "front", "neutral"));
        burnAwayCard(button, "front", "neutral");
        await wait(200);

        // 2. Resolve the attack
        if (isCorrect) {
          state.combo += 1;
          const outcome = buildPlayerAttackOutcome();
          await applyPlayerAttackOutcome(outcome);
        } else {
          state.combo = 0;
          const outcome = buildEnemyAttackOutcome();
          await applyEnemyAttackOutcome(outcome);
        }

        // 3. Extract selected buttons to fixed wrapper to fly to center
        const wrapper = document.createElement("div");
        wrapper.className = "rpg-theme-container multi-resolve-wrapper";
        wrapper.style.cssText = "position: fixed; inset: 0; pointer-events: auto; z-index: 99999;";
        
        wrapper.addEventListener("click", () => {
          const inspected = wrapper.querySelector(".inspected-active") as HTMLElement;
          if (inspected) {
            inspected.classList.remove("inspected-active");
            wrapper.classList.remove("is-inspecting");
          }
        });
        
        // Add overlay backdrop
        const overlay = document.createElement("div");
        overlay.className = "resolution-backdrop";
        overlay.style.cssText = "position: absolute; inset: 0; background: rgba(4, 7, 18, 0.55); backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.6s ease-out;";
        wrapper.appendChild(overlay);
        document.body.appendChild(wrapper);

        requestAnimationFrame(() => { overlay.style.opacity = "1"; });

        selectedBtns.forEach((btn, i) => {
          const rect = btn.getBoundingClientRect();
          // swap to fixed positioned inside wrapper
          const clone = btn.cloneNode(true) as HTMLElement;
          
          // Copy the drawn canvas face so the clone isn't empty
          const origFront = btn.querySelector(".answer-front") as HTMLCanvasElement;
          const cloneFront = clone.querySelector(".answer-front") as HTMLCanvasElement;
          if (origFront && cloneFront) {
            cloneFront.getContext("2d")?.drawImage(origFront, 0, 0);
          }

          clone.style.position = 'absolute';
          clone.style.left = `${rect.left}px`;
          clone.style.top = `${rect.top}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.margin = '0';
          clone.classList.add("multi-resolve-clone");
          wrapper.appendChild(clone);
          
          clone.addEventListener("click", (e) => {
            e.stopPropagation();
            const isCurrentlyInspected = clone.classList.contains("inspected-active");
            
            // Clear others
            wrapper.querySelectorAll(".play-card").forEach(c => c.classList.remove("inspected-active"));
            
            if (!isCurrentlyInspected) {
              clone.classList.add("inspected-active");
              wrapper.classList.add("is-inspecting");
            } else {
              clone.classList.remove("inspected-active");
              wrapper.classList.remove("is-inspecting");
            }
          });

          btn.style.opacity = "0"; // hide original

          setTimeout(() => {
            clone.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            const total = selectedBtns.length;
            const span = Math.min(window.innerWidth * 0.6, 500); 
            const gap = total > 1 ? span / (total - 1) : 0;
            const startX = (window.innerWidth / 2) - (span / 2);
            
            const targetX = total === 1 ? window.innerWidth / 2 : startX + (i * gap);
            clone.style.left = `calc(${targetX}px - ${rect.width/2}px)`;
            clone.style.top = `calc(50% - ${rect.height/2}px)`;
            clone.style.transform = `scale(1.1) rotate(${(i - (total-1)/2) * 5}deg)`;
            clone.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)";
          }, 50);

          (btn as any).__clone = clone;
        });

        await wait(1000);

        // 4. Evaluate correctness of selected cards
        const correctSet = new Set(q.correctAnswers || []);
        const evalPromises = selectedBtns.map(async btn => {
           const clone = (btn as any).__clone as HTMLElement;
           const valText = (q.options || [])[Number(clone.dataset.answer!)];
           if (!correctSet.has(valText)) {
             clone.classList.remove('pulse-ready');
             
             // The user requested to turn the wrong part into the golden correction card via flip
             // We'll prepare the back face as a legendary golden card
             setResultFace(clone, {
                 title: "The Truth",
                 copy: (q.correctAnswers || []).join(", "),
                 tone: "legendary",
                 glyph: "📜"
             });
             
             animateStrike("player", 0, "BURNED"); // simulate an explosion effect
             
             // Now flip it to reveal the correction
             clone.classList.add("is-flipped", "card-legendary");
             clone.style.boxShadow = "0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(255, 215, 0, 0.4)";
             clone.style.transform = clone.style.transform + " scale(1.15)";
             clone.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
             
           } else {
             // Glow correct selections
             clone.classList.remove('pulse-ready');
             clone.style.boxShadow = "0 0 30px #4eb789";
             clone.style.borderColor = "#4eb789";
             // Optional pulse animation
             clone.animate([
              { transform: clone.style.transform },
              { transform: clone.style.transform.replace('scale(1.1)', 'scale(1.2)') },
              { transform: clone.style.transform }
             ], { duration: 400, easing: 'ease-out' });
           }
        });
        
        await Promise.all(evalPromises);

        await wait(2400);

        // 5. If missed correct answers, spawn them falling from the sky
        const missedCorrect = (q.correctAnswers || []).filter(ans => !selectedSet.has(ans));
        const hasWrongSelection = Array.from(selectedSet).some(idx => !correctSet.has((q.options || [])[Number(idx)]));
        
        if (missedCorrect.length > 0 && !hasWrongSelection) {
           missedCorrect.forEach((missedVal, i) => {
              const wrap = document.createElement("div");
              wrap.innerHTML = createAnswerCard({
                value: missedVal, title: missedVal, copy: "Missed", glyph: "!", layout: "default", tone: "epic", hideTag: true
              });
              const newCard = wrap.firstChild as HTMLElement;
              
              newCard.addEventListener("click", (e) => {
                e.stopPropagation();
                const isCurrentlyInspected = newCard.classList.contains("inspected-active");
                wrapper.querySelectorAll(".play-card").forEach(c => c.classList.remove("inspected-active"));
                wrapper.classList.remove("is-inspecting");
                if (!isCurrentlyInspected) {
                  newCard.classList.add("inspected-active");
                  wrapper.classList.add("is-inspecting");
                }
              });

              newCard.style.position = 'absolute';
              newCard.style.left = '50%';
              newCard.style.top = '-200px';
              newCard.style.transform = `translate(-50%, -50%) rotate(${Math.random()*20-10}deg)`;
              newCard.style.width = '240px';
              newCard.style.height = '336px'; // typical card aspect ratio
              wrapper.appendChild(newCard);
              
              const newCanvas = newCard.querySelector(".answer-front") as HTMLCanvasElement;
              if (newCanvas) {
                drawAnswerCardFace(newCanvas, { truthy: true, tag: "", title: missedVal, copy: "Missed", glyph: "!", layout: "default" });
              }
              
              setTimeout(() => {
                newCard.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                newCard.style.top = `calc(50% + ${150 + (i * 30)}px)`; // Offset slightly if multiple
                newCard.style.transform = `translate(-50%, -50%) scale(0.9) rotate(${(i-0.5)*15}deg)`;
                newCard.style.boxShadow = "0 0 30px #FA0";
              }, 50 + (i * 100));
           });
           await wait(1200);
        }

        await wait(4000);
        
        // 6. Cleanup - Burn away everything remaining in the wrapper
        const cardsToBurn = Array.from(wrapper.querySelectorAll(".play-card")) as HTMLElement[];
        const burnPromises = cardsToBurn.map(card => {
           let tone: "neutral" | "legendary" | "silver" | "good" | "bad" = "neutral";
           if (card.classList.contains("card-legendary")) tone = "legendary";
           else if (card.classList.contains("card-epic") || card.classList.contains("multi-selected")) tone = "silver";
           else if (card.classList.contains("true-card") || card.style.boxShadow.includes("rgb(78, 183, 137)") || card.style.borderColor.includes("rgb(78, 183, 137)")) tone = "good";
           else if (card.classList.contains("false-card")) tone = "bad";
           
           // If it's flipped or has result metadata, use "result" source
           const isFlipped = card.classList.contains("is-flipped");
           
           // Make sure all cards in the wrapper are visible before burning
           card.style.opacity = "1";
           card.classList.remove("inspected-active");

           return burnAwayCard(card, isFlipped ? "result" : "front", tone);
        });
        
        await Promise.all(burnPromises);
        await wait(300); 
        
        wrapper.style.opacity = "0";
        wrapper.style.transition = "opacity 0.4s ease-out";
        await wait(400);
        wrapper.remove();
        
        state.revealRunning = false;
        if (state.player.hp <= 0) { gameOver(); return; }
        if (state.mode === "victory" || state.questionDeck.length === 0) { victory(); return; }
        continueRunFlow(); return;
      }

      const otherButtons = $$("[data-answer]").filter((node) => node !== button);

      if (isCorrect) {
        state.combo += 1;
        const outcome = buildPlayerAttackOutcome();
        await runAnswerRevealStart({ chosenButton: button, burnedButtons: otherButtons, title: outcome.card.title, copy: outcome.card.copy, tone: "good", correct: true });
        await applyPlayerAttackOutcome(outcome);
        await floatAndFlipCard(button, 100);
        await wait(260);
        await finishAnswerReveal(button);
        state.revealRunning = false;
        if (state.mode === "victory" || state.questionDeck.length === 0) { victory(); return; }
        continueRunFlow(); return;
      }

      state.combo = 0;
      const outcome = buildEnemyAttackOutcome();
      await runAnswerRevealStart({ chosenButton: button, burnedButtons: otherButtons, title: "Wrong", copy: outcome.card.copy, tone: "bad", correct: false });
      await applyEnemyAttackOutcome(outcome);
      await floatAndFlipCard(button, 100);
      await wait(260);
      await finishAnswerReveal(button);
      await showCorrectAnswer(q);
      state.revealRunning = false;
      if (state.player.hp <= 0) { gameOver(); return; }
      if (state.questionDeck.length === 0) { victory(); return; }
      continueRunFlow();
    }

    async function resolveEvent(choice: boolean, button: HTMLElement) {
      state.lock = true; state.revealRunning = true; state.hidePrompt = true;
      const otherButton = $$("[data-answer]").find((node) => node !== button);
      const result = state.currentEvent.onChoose(choice, state);
      const choiceMeta = state.currentEvent.choices[String(choice)];
      clampPlayerHp(); refreshUiPanels();
      await runAnswerRevealStart({ chosenButton: button, burnedButtons: otherButton ? [otherButton] : [], title: choiceMeta.title, copy: result, tone: "neutral", correct: true });
      await floatAndFlipCard(button, 100);
      await wait(820); await finishAnswerReveal(button);
      state.revealRunning = false;
      if (state.player.hp <= 0) { gameOver(); return; }
      continueRunFlow();
    }

    function buyItem(item: any) {
      if (state.player.gold < item.cost) { state.lastMessage = "Not enough gold."; renderPrompt(); return; }
      state.lock = true; state.player.gold -= item.cost; item.onBuy(); clampPlayerHp(); state.lastMessage = `Bought ${item.name}.`; renderAll();
      setTimeout(() => continueRunFlow(), 720);
    }

    function buildPlayerAttackOutcome() {
      const enemy = state.enemies[state.enemyIndex]; 
      const build = getPlayerBuild(); 
      const crit = Math.random() < build.crit;
      
      // COMBO SYSTEM: Calculate multiplier based on 5-hit streaks
      const comboMult = Math.floor(state.combo / 5) + 1;
      
      let baseDmg = build.attack + Math.floor(Math.random() * 5);
      let damage = Math.round(baseDmg * comboMult);
      
      if (crit) damage = Math.round(damage * 1.75); 
      
      const nextEnemyHp = Math.max(0, state.enemyHp - damage); 
      const defeated = nextEnemyHp <= 0;
      
      let burstLabel = comboMult > 1 ? `${comboMult}X COMBO!` : (crit ? "CRIT!" : "HIT!");
      if (crit && comboMult > 1) burstLabel = `ULTRA CRIT!`;

      return { 
        damage, 
        crit, 
        burstLabel, 
        nextEnemyHp, 
        defeated, 
        rewardGold: defeated ? Math.round(enemy.gold * (1 + (state.combo * 0.05))) : 0, 
        healAmount: defeated ? 8 : 0, 
        card: { 
          title: comboMult > 1 ? `${comboMult}X Combo Strike` : (crit ? "Critical Hit" : "Correct"), 
          copy: defeated ? `You hit ${enemy.name} for ${damage} and finish it. +${enemy.gold} gold, +8 HP.` : `You hit ${enemy.name} for ${damage} damage. ${nextEnemyHp} HP remain.` 
        } 
      };
    }
    
    const rarityTiers = [
      { id: "common", name: "Common", color: "#eef2ff", power: 1.0, weight: 120 },
      { id: "uncommon", name: "Uncommon", color: "#61f6b5", power: 2.2, weight: 60 },
      { id: "rare", name: "Rare", color: "#76e7ff", power: 4.5, weight: 30 },
      { id: "epic", name: "Epic", color: "#b492ff", power: 8.5, weight: 16 },
      { id: "legendary", name: "Legendary", color: "#ffd667", power: 18.0, weight: 8 },
      { id: "mythic", name: "Mythic", color: "#ff7a91", power: 40.0, weight: 4 },
      { id: "relic", name: "Relic", color: "#ff4bf3", power: 90.0, weight: 2 },
      { id: "divine", name: "Divine", color: "#4bf3ff", power: 220.0, weight: 0.9 },
      { id: "celestial", name: "Celestial", color: "#ffffff", power: 600.0, weight: 0.3 }
    ];

    function generateDrop(enemy: any) {
         const build = getPlayerBuild();
         const comboLuck = (state.combo / 10);
         const luck = build.luck + comboLuck;

         const isCoin = Math.random() < (0.3 + luck * 0.15); 
         if (isCoin) {
             const extraGold = Math.floor(enemy.hp * (0.2 + luck * 0.1));
             return { type: 'gold', value: extraGold };
         }

         const slots = ["weapon", "offhand", "armor", "boots", "ring", "charm"] as const;
         const slot = slots[Math.floor(Math.random() * slots.length)];
         
         // Select Rarity based on luck
         // Boost weights for non-common tiers based on luck
         const adjustedTiers = rarityTiers.map(t => ({
           ...t,
           w: t.id === "common" ? t.weight : t.weight * (1 + luck * 0.45)
         }));
         const totalW = adjustedTiers.reduce((acc, t) => acc + t.w, 0);
         let roll = Math.random() * totalW;
         let selectedTier = rarityTiers[0];
         for (const t of adjustedTiers) {
           if (roll < t.w) { selectedTier = t; break; }
           roll -= t.w;
         }

         // Base power from enemy HP scaled by tier
         const basePower = (enemy.hp / 22) * selectedTier.power; 
         
         const namePrefixes: Record<string, string[]> = {
           common: ["Rusty", "Dull", "Simple", "Worn"],
           uncommon: ["Keen", "Polished", "Sturdy", "Fine"],
           rare: ["Gleaming", "Sharp", "Exquisite", "Masterwork"],
           epic: ["Ancient", "Arcane", "Infused", "Spellbound"],
           legendary: ["Legendary", "Fabled", "Mythical", "Warlord's"],
           mythic: ["Oblivion", "Ethereal", "Nightmare", "Void-Touched"],
           relic: ["Forgotten", "Timeless", "Relic", "Ancestral"],
           divine: ["God-King's", "Glorious", "Righteous", "Sovereign"],
           celestial: ["Infinite", "Prismatic", "Universal", "God-Slayer's"]
         };
         
         const prefixList = namePrefixes[selectedTier.id as keyof typeof namePrefixes] || namePrefixes.common;
         const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
         
         const newId = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
         const slotIcons: Record<string, string> = {
           weapon: "🗡️", offhand: "🛡️", armor: "👕", boots: "🥾", ring: "💍", charm: "✨"
         };

         const item: any = {
           id: newId,
           name: `${prefix} ${slot.charAt(0).toUpperCase() + slot.slice(1)}`,
           icon: slotIcons[slot] || "✨",
           slot,
           sellPrice: Math.floor(basePower * 10) + 10,
           rarityId: selectedTier.id,
           rarityName: selectedTier.name,
           rarityColor: selectedTier.color,
           mods: {}
         };
         
         // Celestial items get extra stats
         const statMult = selectedTier.id === "celestial" ? 1.5 : 1.0;

         if (slot === "weapon" || slot === "offhand") {
            item.mods.attack = Math.max(1, Math.floor(basePower * (Math.random() * 0.8 + 0.8) * statMult));
            if (selectedTier.id === "celestial" || Math.random() < 0.2) item.mods.crit = 0.05 * selectedTier.power * 0.1;
         } else if (slot === "armor" || slot === "boots") {
            item.mods.armor = Math.max(1, Math.floor(basePower * (Math.random() * 0.5 + 0.3) * statMult));
            item.mods.maxHp = Math.max(5, Math.floor(basePower * (Math.random() * 4 + 4) * statMult));
         } else {
            // Rings/Charms
            const type = Math.random();
            if (type < 0.3) item.mods.attack = Math.max(1, Math.floor(basePower * 0.7 * statMult));
            else if (type < 0.6) item.mods.maxHp = Math.max(5, Math.floor(basePower * 10 * statMult));
            else if (type < 0.8) item.mods.crit = 0.02 * selectedTier.power * 0.2;
            else item.mods.luck = 0.1 * selectedTier.power * 0.15;
         }
         
         // Cap some percentage stats
         if (item.mods.crit > 0.8) item.mods.crit = 0.8;
         if (item.mods.dodge > 0.6) item.mods.dodge = 0.6;
         
         return { type: 'gear', item };
    }

    async function applyPlayerAttackOutcome(outcome: any) {
      state.enemyHp = outcome.nextEnemyHp; renderScene();
      animateStrike("player", outcome.damage, outcome.burstLabel);
      await wait(700);
      if (!outcome.defeated) { refreshUiPanels(); return; }
      
      const enemy = state.enemies[state.enemyIndex];
      const chanceDrop = Math.random() < 0.5; // 50% drop chance
      let dropMessage = "";
      let goldEarned = outcome.rewardGold;
      
      if (chanceDrop) {
         const drop = generateDrop(enemy);
         if (drop.type === 'gold') {
             goldEarned += drop.value;
             dropMessage = `\nDropped extra ${drop.value} gold!`;
         } else if (drop.type === 'gear') {
             dropMessage = `\nDropped ${drop.item.name}!`;
             const currProg = progressionRef.current;
             if (currProg && onUpdateProgression) {
                 const newProg = { ...currProg, backpack: [...(currProg.backpack || []), drop.item] };
                 onUpdateProgression(newProg);
             }
         }
      }

      state.player.gold += goldEarned; healPlayer(outcome.healAmount);
      spawnDamage("gold", `+${goldEarned} gold`, 72, 42);
      if (dropMessage) {
        setTimeout(() => updateBanner(dropMessage.trim()), 1000);
      }
      
      els.enemyFighter.classList.add("defeated"); refreshUiPanels();
      await wait(260); state.pendingEnemyAdvance = true;
      if (state.enemyIndex >= state.enemies.length - 1) { /* Do nothing, handled by question count */ } else if (maybeEncounter()) { state.pendingEnemyAdvance = true; }
    }
    function buildEnemyAttackOutcome() {
      const enemy = state.enemies[state.enemyIndex]; const build = getPlayerBuild();
      if (Math.random() < build.dodge) return { dodged: true, playerDied: false, card: { title: "Wrong", copy: `${enemy.name} lunges, but you dodge the hit.`, tone: "bad" } };
      const raw = enemy.attack + Math.floor(Math.random() * 4); const damage = Math.max(1, raw - build.armor); const nextPlayerHp = Math.max(0, state.player.hp - damage);
      return { dodged: false, damage, playerDied: nextPlayerHp <= 0, nextPlayerHp, card: { title: "Wrong", copy: nextPlayerHp > 0 ? `${enemy.name} hits you for ${damage} damage. ${nextPlayerHp} HP left.` : `${enemy.name} hits you for ${damage} damage and drops you to 0 HP.` } };
    }
    async function applyEnemyAttackOutcome(outcome: any) {
      if (outcome.dodged) { animateDodge(); await wait(720); refreshUiPanels(); return; }
      takePlayerDamage(outcome.damage); animateStrike("enemy", outcome.damage, "OUCH"); refreshUiPanels(); await wait(760); refreshUiPanels();
    }

    function gameOver() { state.mode = "gameover"; state.lock = false; state.hidePrompt = false; state.revealRunning = false; state.pendingEnemyAdvance = false; renderAll(); }
    function victory() { state.mode = "victory"; state.lock = false; state.hidePrompt = false; state.revealRunning = false; state.pendingEnemyAdvance = false; renderAll(); }

    function animateStrike(side: string, damage: number, burstLabel: string) {
      const attacker = side === "player" ? els.playerFighter : els.enemyFighter; const defender = side === "player" ? els.enemyFighter : els.playerFighter; const slash = side === "player" ? els.playerSlash : els.enemySlash;
      attacker.classList.remove("attacking"); defender.classList.remove("hit"); slash.classList.remove("show");
      void attacker.offsetWidth;
      attacker.classList.add("attacking", side); defender.classList.add("hit"); slash.textContent = side === "player" ? "✨" : "💥"; slash.classList.add("show");
      const popX = side === "player" ? 76 : 22; const popY = 40;
      spawnDamage("bad", `-${damage}`, popX, popY); spawnDamage("good", burstLabel, side === "player" ? 67 : 30, 31, 1.2);
      
      // Screen Shake for stronger impact
      const appEl = document.querySelector(".rpg-theme-container .app") as HTMLElement;
      if (appEl) {
        appEl.style.animation = "none";
        void appEl.offsetWidth;
        appEl.style.animation = damage > 15 ? "rpg-heavy-shake 0.4s ease-out" : "rpg-light-shake 0.3s ease-out";
      }

      setTimeout(() => { attacker.classList.remove("attacking"); defender.classList.remove("hit"); slash.classList.remove("show"); }, 500);
    }
    function animateDodge() { spawnDamage("good", "DODGE", 24, 36, 0.95); els.playerFighter.style.transform = "translateX(-10px)"; setTimeout(() => { els.playerFighter.style.transform = ""; }, 220); }
    function spawnDamage(type: string, text: string, xPct: number, yPct: number, scale = 1) {
      const node = document.createElement("div"); node.className = `damage-pop ${type}`; node.textContent = text; node.style.left = `${xPct}%`; node.style.top = `${yPct}%`; node.style.transform = `scale(${scale})`;
      els.damageLayer.appendChild(node); setTimeout(() => node.remove(), 1000);
    }

    function resetGame() {
      for (let key in recordedAnswers) delete recordedAnswers[key];
      for (let key in recordedWrongPartSelections) delete recordedWrongPartSelections[key];
      state.mode = "quiz"; state.lock = false; state.modalOpen = false; state.revealRunning = false; state.hidePrompt = false; state.passives = []; state.enemyIndex = 0;
      state.currentQuestion = null; state.currentEvent = null; state.currentShop = [];
      state.questionDeck = [...sourceQuestions];
      state.combo = 0; state.itemId = 0; state.pendingEnemyAdvance = false; state.lastMessage = "";

      // Calculate equipment bonuses
      let equipAtk = 0, equipDef = 0, equipHp = 0;
      const currentProgression = progressionRef.current;
      if (currentProgression?.equipped) {
        // Hardcoded item values to match shop
        const gearMap: Record<string, { attack?: number, defense?: number, maxHp?: number }> = {
          'rusty_blade': { attack: 5 },
          'shadow_dagger': { attack: 15 },
          'leather_tunic': { defense: 4, maxHp: 20 },
          'iron_plate': { defense: 12, maxHp: 50 },
          'lucky_charm': { maxHp: 15, attack: 2 },
          'dragon_scale': { defense: 8, attack: 8, maxHp: 100 }
        };
        Object.values(currentProgression.equipped).forEach(id => {
          if (id && gearMap[id]) {
            equipAtk += gearMap[id].attack || 0;
            equipDef += gearMap[id].defense || 0;
            equipHp += gearMap[id].maxHp || 0;
          }
        });
      }

      const heroType = currentProgression?.equipped?.hero || "hero";
      const heroName = heroType.charAt(0).toUpperCase() + heroType.slice(1);

      state.player = { 
        name: heroName, 
        type: heroType, 
        hp: (currentProgression?.stats.maxHp || 100) + equipHp, 
        gold: 0, 
        apples: 0, 
        baseAttack: (currentProgression?.stats.attack || 8) + equipAtk, 
        baseArmor: (currentProgression?.stats.defense || 0) + equipDef, 
        baseCrit: 0.08, 
        baseDodge: 0.04, 
        baseMaxHp: (currentProgression?.stats.maxHp || 100) + equipHp, 
        equipment: { weapon: makeItem(itemDefs.starterWand), offhand: null, ring: null, boots: null, charm: null }, 
        backpack: [] 
      };
      els.cardGrid.style.height = ""; closeModal(); 
      const enemyTypes = [
        { name: "Moss Slime", type: "slime", intro: "A mossy slime jiggles onto the trail." },
        { name: "Cave Bat", type: "bat", intro: "A fluttering bat descends from the ceiling." },
        { name: "Bone Skeleton", type: "skeleton", intro: "A clattering skeleton rises from the earth." },
        { name: "Forest Wolf", type: "wolf", intro: "A wild wolf jumps from the trees." },
        { name: "Sneaky Goblin", type: "demon", intro: "A goblin skids in with a rusty grin." },
        { name: "Giant Spider", type: "spider", intro: "A massive spider drops from a web above." },
        { name: "Cursed Ghost", type: "ghost", intro: "A pale ghost drifts out of the darkness." },
        { name: "Stone Golem", type: "golem", intro: "A heavy golem steps from the dark." },
        { name: "Rogue Knight", type: "knight", intro: "An armored knight blocks your path." },
        { name: "Forest Wyrm", type: "dragon", intro: "A wyrm descends from the moonlit sky." },
        { name: "Phoenix", type: "phoenix", intro: "A fiery bird bursts into the sky." },
      ];
      state.enemies = Array.from({ length: Math.max(10, sourceQuestions.length) }, (_, i) => {
        const t = enemyTypes[i % enemyTypes.length];
        const scale = 1 + Math.floor(i / enemyTypes.length) * 0.5 + (i * 0.1);
        return {
          name: `${t.name} Lvl ${i + 1}`,
          type: t.type,
          hp: Math.floor(36 * scale),
          attack: Math.floor(8 * scale),
          gold: Math.floor(10 * scale),
          intro: t.intro
        };
      });
      state.enemyHp = state.enemies[0].hp; setEnemy(state.enemies[0], true); nextQuestion(false); renderAll();

    }

    function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      const rr = Math.min(r, w * 0.5, h * 0.5); ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr); ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
    }

    function drawAnswerCardFace(canvas: HTMLCanvasElement, options: any) {
      const ctx = canvas.getContext("2d", { alpha: true }); if(!ctx) return;
      const W = canvas.width; const H = canvas.height;
      const isLegendary = options.isLegendary || false;
      const tone = options.tone || "default";
      const isSilver = tone === "silver";
      
      const gold = isLegendary ? "#FFD700" : (isSilver ? "#E0E0E0" : "#D4AF37");
      const darkGold = isLegendary ? "#B8860B" : (isSilver ? "#808A9F" : "#AA8627");
      const silver = isSilver ? "#FFFFFF" : "#E0E0E0";
      const isDefault = options.layout === "default";
      const voidTop = isLegendary ? "#4A3B06" : (isSilver ? "#1C2431" : (isDefault ? "#0d1b2a" : (options.truthy ? "#0D1B2A" : "#2E0A16")));
      const voidBot = isLegendary ? "#1A1402" : (isSilver ? "#0B1015" : (isDefault ? "#000814" : (options.truthy ? "#000814" : "#1A0005")));
      const accent = isLegendary ? "#FFFACD" : (isSilver ? "#A3D1FF" : (isDefault ? "#66FCF1" : (options.truthy ? "#66FCF1" : "#FF6B6B")));
      
      ctx.clearRect(0, 0, W, H);
      
      // Astral void background with subtle swirl
      const bgGrad = ctx.createRadialGradient(W/2, H/3, 0, W/2, H/2, H*0.8);
      bgGrad.addColorStop(0, voidTop);
      bgGrad.addColorStop(1, voidBot);
      
      roundRectPath(ctx, 1, 1, W - 2, H - 2, 20); 
      ctx.fillStyle = bgGrad; 
      ctx.fill();

      // Nebula clouds
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        const cx = Math.random() * W;
        const cy = Math.random() * H;
        const r = 50 + Math.random() * 100;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, accent + "33"); // 20% opacity
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,W,H);
      }

      // Starry dust
      ctx.globalCompositeOperation = "source-over";
      const starCount = isLegendary ? 300 : 80;
      for(let i=0; i<starCount; i++) {
         ctx.fillStyle = Math.random() > 0.5 ? gold : (isLegendary ? "#FFF" : silver);
         ctx.globalAlpha = Math.random() * (isLegendary ? 0.8 : 0.6) + 0.1;
         const sz = Math.random() * (isLegendary ? 3 : 2);
         ctx.beginPath();
         // make tiny stars
         ctx.arc(Math.random() * W, Math.random() * H, sz, 0, Math.PI*2);
         ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Card Artwork Box with gradient overlay
      let isLongText = options.layout === "default" && !options.copy && options.title.length > 70;
      let isVeryLongText = options.layout === "default" && !options.copy && options.title.length > 150;
      
      const artH = isVeryLongText ? H * 0.20 : (isLongText ? H * 0.30 : H * 0.45);
      
      ctx.save();
      roundRectPath(ctx, 12, 12, W - 24, artH, 16);
      ctx.clip();
      const artGrad = ctx.createLinearGradient(0, 12, 0, 12 + artH);
      artGrad.addColorStop(0, `rgba(255,255,255,0.05)`);
      artGrad.addColorStop(1, `rgba(0,0,0,0.4)`);
      ctx.fillStyle = artGrad;
      ctx.fill();

      // Magical runes in background of art
      ctx.font = "italic 24px 'Cormorant Garamond'";
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.textAlign = "center";
      for(let i=0; i<6; i++) {
        ctx.fillText("ARCANE EXAMS", Math.random()*W, 12 + Math.random()*artH);
      }
      ctx.restore();

      // Art Box border
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 3;
      roundRectPath(ctx, 12, 12, W - 24, artH, 16);
      ctx.stroke();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1;
      roundRectPath(ctx, 16, 16, W - 32, artH - 8, 12);
      ctx.stroke();

      // Lower frame (body)
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRectPath(ctx, 12, 12 + artH - 10, W - 24, H - artH - 14, 8);
      ctx.fill();
      
      // Outer intricate frame for entire card
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 6;
      roundRectPath(ctx, 4, 4, W - 8, H - 8, 20);
      ctx.stroke();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      roundRectPath(ctx, 4, 4, W - 8, H - 8, 20);
      ctx.stroke();
      
      // Inner framing lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = silver;
      roundRectPath(ctx, 10, 10, W - 20, H - 20, 15);
      ctx.stroke();

      // Corner ornate details
      const drawOrnateCorner = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = darkGold;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24, 0);
        ctx.quadraticCurveTo(12, 12, 0, 24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = gold;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Little embedded gem
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(6, 6, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      };
      drawOrnateCorner(8, 8, 0);
      drawOrnateCorner(W-8, 8, Math.PI/2);
      drawOrnateCorner(W-8, H-8, Math.PI);
      drawOrnateCorner(8, H-8, -Math.PI/2);

      // Top rune circle (crystal)
      ctx.save();
      ctx.translate(W/2, 12 + artH/2);
      
      // Background glow for crystal
      ctx.shadowColor = accent;
      ctx.shadowBlur = 30;
      ctx.fillStyle = voidBot;
      
      // Starburst around crystal
      ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
      for(let i=0; i<12; i++) {
         ctx.rotate(Math.PI/6);
         ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(60, 0); ctx.stroke();
      }

      ctx.strokeStyle = gold;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      
      // Inner ring
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI*2); ctx.stroke();
      
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Glyph
      if (options.glyph) {
          ctx.fillStyle = "#fff";
          ctx.shadowBlur = 15;
          ctx.font = "bold 44px Cinzel, serif";
          ctx.fillText(options.glyph, 0, 4);
      } else if (options.tag && isDefault) {
          ctx.fillStyle = gold;
          ctx.font = "bold 32px Cinzel, serif";
          ctx.fillText(options.tag.toUpperCase(), 0, 4);
      }
      ctx.restore();

      let ribbonText = options.title;
      let bodyText = options.copy;
      // If there's no copy (like for MCQs), use the ribbon area for the TAG (e.g., 'Option A')
      // and put the main text (which could be long) in the copy area.
      if (options.layout === "default" && !options.copy) {
         ribbonText = "OPTION " + options.tag;
         bodyText = options.title;
      }

      // Title Ribbon Overlay
      ctx.save();
      const ribbonY = 12 + artH;
      ctx.fillStyle = "#111";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      // stylized banner
      ctx.moveTo(10, ribbonY - 25);
      ctx.lineTo(W - 10, ribbonY - 25);
      ctx.lineTo(W - 20, ribbonY);
      ctx.lineTo(W - 10, ribbonY + 25);
      ctx.lineTo(10, ribbonY + 25);
      ctx.lineTo(20, ribbonY);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // ribbon inner line
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(15, ribbonY - 20);
      ctx.lineTo(W - 15, ribbonY - 20);
      ctx.lineTo(W - 25, ribbonY);
      ctx.lineTo(W - 15, ribbonY + 20);
      ctx.lineTo(15, ribbonY + 20);
      ctx.lineTo(25, ribbonY);
      ctx.closePath();
      ctx.stroke();

      // Title Text (Short Label)
      ctx.fillStyle = "#ffffff"; 
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;
      ctx.font = "bold 24px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ribbonText, W / 2, ribbonY + 2);
      ctx.restore();

      // Lower text area for description/copy
      const bottomY = ribbonY + 40;
      const textH = H - bottomY - 30; // 30 for bottom padding
      
      if (bodyText) {
        ctx.fillStyle = silver; 
        
        // Dynamically adjust font size to fit long answers
        let fontSize = options.layout === "default" && !options.copy ? 72 : 44;
        let weight = "800";
        let fontFamily = "'Inter', sans-serif";
        
        let lines: string[] = [];
        let lineHeight = 0;
        
        // Keep shrinking font size until it fits
        while (fontSize > 12) {
          ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
          lines = [];
          const words = bodyText.split(" ");
          let line = "";
          for (let i = 0; i < words.length; i += 1) {
            const testLine = line ? `${line} ${words[i]}` : words[i];
            if (ctx.measureText(testLine).width > (W - 60) && line) { 
              lines.push(line); line = words[i]; 
            } else { 
              line = testLine; 
            }
          }
          if (line) lines.push(line);
          
          lineHeight = fontSize * 1.25;
          // If total height fits within textH, we're good
          if (lines.length * lineHeight <= textH - 10) {
            break;
          }
          fontSize -= 2;
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const totalTextHeight = lines.length * lineHeight;
        let startY = bottomY + (textH / 2) - (totalTextHeight / 2) + (fontSize * 0.5);
        
        for(let l of lines) {
          ctx.fillText(l, W / 2, startY);
          startY += lineHeight;
        }

        // Bottom flourish
        ctx.beginPath();
        ctx.moveTo(W/2 - 50, H - 25);
        ctx.lineTo(W/2 + 50, H - 25);
        ctx.strokeStyle = darkGold;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = gold;
        ctx.beginPath(); ctx.arc(W/2, H - 25, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(W/2 - 25, H - 25, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(W/2 + 25, H - 25, 2, 0, Math.PI*2); ctx.fill();
      }
    }

    function drawResultCardFace(canvas: HTMLCanvasElement, result: any) {
      const ctx = canvas.getContext("2d", { alpha: true }); if(!ctx) return;
      const W = canvas.width; const H = canvas.height;
      const gold = "#D4AF37";
      const darkGold = "#AA8627";
      const silver = "#E0E0E0";
      
      const palettes: any = { 
        good: { bgTop: "#091F13", bgBot: "#020A05", accent: "#66FCF1", glyph: "✓" }, 
        bad: { bgTop: "#2D0A14", bgBot: "#110206", accent: "#FF6B6B", glyph: "✕" },
        neutral: { bgTop: "#0B162C", bgBot: "#030712", accent: "#5ba2b8", glyph: "●" },
        legendary: { bgTop: "#332200", bgBot: "#110B00", accent: "#FFD700", glyph: "★" }
      };
      const palette = palettes[result.tone] || palettes.good;
      
      ctx.clearRect(0, 0, W, H);
      
      const bg = ctx.createRadialGradient(W/2, H/3, 0, W/2, H/2, H*0.8); 
      bg.addColorStop(0, palette.bgTop); 
      bg.addColorStop(1, palette.bgBot);
      
      roundRectPath(ctx, 1, 1, W - 2, H - 2, 20); 
      ctx.fillStyle = bg; 
      ctx.fill();

      // Legendary specialty: Radiant Rays
      if (result.tone === "legendary") {
        ctx.save();
        ctx.translate(W/2, H/2);
        ctx.globalCompositeOperation = "screen";
        for(let i=0; i<12; i++) {
          ctx.rotate(Math.PI / 6);
          const ray = ctx.createLinearGradient(0, 0, 0, H);
          ray.addColorStop(0, "rgba(255, 215, 0, 0.15)");
          ray.addColorStop(1, "transparent");
          ctx.fillStyle = ray;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(20, 0);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Nebula clouds
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const cx = Math.random() * W;
        const cy = Math.random() * H;
        const r = 60 + Math.random() * 120;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, palette.accent + "33"); 
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,W,H);
      }

      // Ethereal center glow
      const centerGlow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
      centerGlow.addColorStop(0, `${palette.accent}22`);
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation = "source-over";

      // Starry dust
      for(let i=0; i<150; i++) {
         ctx.fillStyle = Math.random() > 0.5 ? gold : silver;
         ctx.globalAlpha = Math.random() * 0.6 + 0.1;
         const sz = Math.random() * 1.5;
         ctx.beginPath();
         // make tiny stars
         ctx.arc(Math.random() * W, Math.random() * H, sz, 0, Math.PI*2);
         ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Magical runes in background
      ctx.font = "italic 24px 'Cormorant Garamond'";
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.textAlign = "center";
      for(let i=0; i<8; i++) {
        ctx.fillText("VICTORIA ET EXITIUM", Math.random()*W, Math.random()*H);
      }

      // Lower frame (body)
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRectPath(ctx, 12, H/2 + 20, W - 24, H/2 - 32, 8);
      ctx.fill();

      // Outer intricate frame
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 6;
      roundRectPath(ctx, 4, 4, W - 8, H - 8, 20);
      ctx.stroke();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      roundRectPath(ctx, 4, 4, W - 8, H - 8, 20);
      ctx.stroke();
      
      // Inner thin frame
      ctx.lineWidth = 1;
      ctx.strokeStyle = silver;
      roundRectPath(ctx, 10, 10, W - 20, H - 20, 15);
      ctx.stroke();

      // Corner ornate details
      const drawOrnateCorner = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = darkGold;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24, 0);
        ctx.quadraticCurveTo(12, 12, 0, 24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = gold;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Little embedded gem
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(6, 6, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      };
      drawOrnateCorner(8, 8, 0);
      drawOrnateCorner(W-8, 8, Math.PI/2);
      drawOrnateCorner(W-8, H-8, Math.PI);
      drawOrnateCorner(8, H-8, -Math.PI/2);

      const drawDiamond = (x: number, y: number, r: number) => {
         ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x+r, y); ctx.lineTo(x, y+r); ctx.lineTo(x-r, y); ctx.closePath(); ctx.fill();
      };

      // Center magical focal point
      ctx.save();
      ctx.translate(W/2, H/2 - 60);
      
      // Sunburst
      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      for(let i=0; i<32; i++) {
         ctx.rotate(Math.PI/16);
         ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(140, 0); ctx.stroke();
      }

      ctx.shadowColor = palette.accent;
      ctx.shadowBlur = 40;
      ctx.fillStyle = palette.bgBot;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 4;
      
      // Center Diamond
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-55, -55, 110, 110);
      ctx.strokeRect(-55, -55, 110, 110);
      
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(-45, -45, 90, 90);

      ctx.rotate(-Math.PI / 4);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Big Outcome Glyph inside diamond
      ctx.fillStyle = silver;
      ctx.font = "bold 72px Cinzel, serif";
      ctx.shadowBlur = 30; 
      ctx.shadowColor = palette.accent;
      ctx.fillText(palette.glyph, 0, 5);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Title Ribbon Overlay
      ctx.save();
      const ribbonY = H/2 + 20;
      ctx.fillStyle = "#111";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      // stylized banner
      ctx.moveTo(10, ribbonY - 25);
      ctx.lineTo(W - 10, ribbonY - 25);
      ctx.lineTo(W - 20, ribbonY);
      ctx.lineTo(W - 10, ribbonY + 25);
      ctx.lineTo(10, ribbonY + 25);
      ctx.lineTo(20, ribbonY);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // ribbon inner line
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(15, ribbonY - 20);
      ctx.lineTo(W - 15, ribbonY - 20);
      ctx.lineTo(W - 25, ribbonY);
      ctx.lineTo(W - 15, ribbonY + 20);
      ctx.lineTo(15, ribbonY + 20);
      ctx.lineTo(25, ribbonY);
      ctx.closePath();
      ctx.stroke();

      // Title Box Text
      ctx.fillStyle = "#ffffff"; 
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;
      ctx.font = "bold 26px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(result.title || "", W / 2, ribbonY + 2);
      ctx.restore();

      // Copy wrap
      ctx.fillStyle = silver; 
      
      let copyFontSize = 42;
      let copyWeight = "600";
      let lines: string[] = [];
      let currentLineHeight = 0;
      const copyTextH = H - ribbonY - 60; // Available space

      while(copyFontSize > 12) {
        ctx.font = `${copyWeight} ${copyFontSize}px 'Inter', sans-serif`;
        lines = [];
        const words = (result.copy || "").split(" ");
        let line = "";
        for (let i = 0; i < words.length; i += 1) {
          const testLine = line ? `${line} ${words[i]}` : words[i];
          if (ctx.measureText(testLine).width > (W - 60) && line) { 
            lines.push(line); line = words[i]; 
          } else { 
            line = testLine; 
          }
        }
        if (line) lines.push(line);

        currentLineHeight = copyFontSize * 1.3;
        if (lines.length * currentLineHeight <= copyTextH) {
          break;
        }
        copyFontSize -= 2;
      }
      
      const totalCopyBlockHeight = lines.length * currentLineHeight;
      let startY = ribbonY + 40 + (copyTextH / 2) - (totalCopyBlockHeight / 2) + (copyFontSize * 0.4);
      
      for(let l of lines) {
        ctx.fillText(l, W / 2, startY);
        startY += currentLineHeight;
      }
      
      // Bottom flourish
      ctx.beginPath();
      ctx.moveTo(W/2 - 60, H - 20);
      ctx.lineTo(W/2 + 60, H - 20);
      ctx.strokeStyle = darkGold;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(W/2, H - 20, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(W/2 - 30, H - 20, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(W/2 + 30, H - 20, 2, 0, Math.PI*2); ctx.fill();
    }

    function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
      const words = text.split(" "); let line = ""; let currentY = y;
      for (let i = 0; i < words.length; i += 1) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) { ctx.fillText(line, x, currentY); line = words[i]; currentY += lineHeight; } else { line = testLine; }
      }
      if (line) ctx.fillText(line, x, currentY);
    }

    function paintAnswerCardCanvases() {
      $$(".answer-canvas-card").forEach((button: any) => {
        const canvas = button.querySelector(".answer-front");
        const truthy = button.dataset.layout === "event" ? button.dataset.answer !== "false" : true;
        drawAnswerCardFace(canvas, { truthy, tag: button.dataset.tag || "", title: button.dataset.title || "", glyph: button.dataset.glyph || "", layout: button.dataset.layout || "default" });
      });
    }

    function setResultFace(button: any, result: any) {
      button.classList.add(`result-${result.tone}`);
      button.__resultFace = result;
      const backCanvas = button.querySelector(".answer-back-canvas");
      if (backCanvas) drawResultCardFace(backCanvas, result);
    }

    function animateFreshCards() {
      const cards = $$(".card-pre-enter");
      if (!cards.length) return;
      cards.forEach((card, index) => { card.style.transitionDelay = `${index * 70}ms`; });
      setTimeout(() => {
        cards.forEach((card) => {
          card.classList.add("card-enter-active");
          card.addEventListener("transitionend", () => { card.classList.remove("card-pre-enter", "card-enter-active"); card.style.transitionDelay = ""; card.style.pointerEvents = ""; }, { once: true });
        });
      }, 50);
    }

    function makeBurnSourceCanvas(button: any, sourceType: string) {
      if (sourceType === "result") {
        const liveResultCanvas = button.querySelector(".answer-back-canvas");
        if (liveResultCanvas) {
          return cloneCanvasElement(liveResultCanvas);
        }
        const c = document.createElement("canvas");
        c.width = 360;
        c.height = 504;
        drawResultCardFace(c, button.__resultFace || {
          title: "Result",
          copy: "",
          tone: "neutral"
        });
        return c;
      }
      
      const front = button.querySelector(".answer-front");
      if (front) return cloneCanvasElement(front);
      
      // Fallback for non-canvas cards (like the confirm button or simple info cards)
      const c = document.createElement("canvas");
      c.width = 360; c.height = 504;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1a2a38";
        ctx.fillRect(0,0,360,504);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.strokeRect(10,10, 340, 484);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 32px Cinzel, serif";
        ctx.textAlign = "center";
        const title = button.querySelector(".card-title")?.textContent || "Card";
        ctx.fillText(title, 180, 252);
      }
      return c;
    }

    async function burnAwayCard(button: any, sourceType = "front", tone = "neutral") {
      const burnCanvas = button.querySelector(".burn-canvas");
      if (!burnCanvas) return;
      const burnCtx = burnCanvas.getContext("2d", { alpha: true });
      const sourceCanvas = makeBurnSourceCanvas(button, sourceType);

      burnCanvas.width = sourceCanvas.width;
      burnCanvas.height = sourceCanvas.height;

      burnCtx.clearRect(0, 0, burnCanvas.width, burnCanvas.height);
      burnCtx.drawImage(sourceCanvas, 0, 0);

      burnCanvas.style.opacity = "1";

      await new Promise((resolve) => requestAnimationFrame(resolve));

      button.classList.add("is-burning");

      const animator = makeBurnAnimator(sourceCanvas, burnCanvas, tone);
      await animator.start();
    }

    function cleanupFloatingCard(button: any) {
      if (button.__placeholder) {
        button.__placeholder.remove();
        button.__placeholder = null;
      }
      if (button.__overlay) {
        const overlay = button.__overlay;
        overlay.style.opacity = "0";
        setTimeout(() => {
          if (overlay.parentNode) overlay.remove();
        }, 300);
        button.__overlay = null;
      }
      if (button.__wrapper) {
         const wrapper = button.__wrapper;
         setTimeout(() => {
             if (wrapper.parentNode) {
                 wrapper.remove();
             }
         }, 300);
         button.__wrapper = null;
      }
    }

    async function runAnswerRevealStart({ chosenButton, burnedButtons, title, copy, tone, correct }: any) {
      const gridRect = els.cardGrid.getBoundingClientRect(); els.cardGrid.style.height = `${gridRect.height}px`; els.cardGrid.classList.add("is-animating");
      setResultFace(chosenButton, { title, copy, tone }); chosenButton.classList.add("is-selected");
      
      const p = burnedButtons.map((b: any) => burnAwayCard(b, "front"));
      await Promise.all(p);

      burnedButtons.forEach((b: any) => {
        b.style.visibility = "hidden";
      });
    }

    async function finishAnswerReveal(chosenButton: any) {
      const tone = chosenButton.__resultFace?.tone || "neutral";
      await burnAwayCard(chosenButton, "result", tone);
      cleanupFloatingCard(chosenButton);
      els.cardGrid.innerHTML = ""; els.cardGrid.style.height = ""; els.cardGrid.classList.remove("is-animating");
    }

    async function floatAndFlipCard(button: any, delayBeforeMove = 240) {
      const rect = button.getBoundingClientRect();
      const baseWidth = button.offsetWidth;
      const baseHeight = button.offsetHeight;
      const initialScale = rect.width / baseWidth;

      const visualCenterX = rect.left + rect.width / 2;
      const visualCenterY = rect.top + rect.height / 2;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const startDx = visualCenterX - centerX;
      const startDy = visualCenterY - centerY;
      
      const maxW = window.innerWidth * 0.85;
      const maxH_based_W = (window.innerHeight * 0.70) * 0.67; // Height should not exceed 70% of screen
      const targetWidth = Math.min(maxW, maxH_based_W, 340); // Cap at 340px for desktop to keep background visible
      const targetScale = targetWidth / baseWidth;

      const placeholder = document.createElement("div"); 
      placeholder.className = "card-placeholder"; 
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;

      button.parentNode.insertBefore(placeholder, button); 
      button.__placeholder = placeholder;

      // Extract to body to fix container clipping issues
      const wrapper = document.createElement("div");
      // Add the identifying class so CSS vars map properly
      wrapper.className = "rpg-theme-container rpg-card-fullscreen-wrapper";
      wrapper.style.cssText = "position: fixed !important; top: 0px !important; left: 0px !important; width: 100vw !important; height: 100vh !important; inset: 0px !important; pointer-events: none; z-index: 99999; background: transparent !important; padding: 0px; margin: 0px; border: none; overflow: visible !important; display: block !important; animation: none !important; transform: none !important;";
      document.body.appendChild(wrapper);
      
      wrapper.appendChild(button);
      button.__wrapper = wrapper;

      button.classList.add("floating-card");
      button.style.setProperty("--tilt", "0deg");
      button.style.position = "absolute";
      button.style.left = `50%`;
      button.style.top = `50%`;
      button.style.marginLeft = `${-baseWidth / 2}px`;
      button.style.marginTop = `${-baseHeight / 2}px`;
      button.style.width = `${baseWidth}px`;
      button.style.height = `${baseHeight}px`;
      button.style.zIndex = "2005";
      button.style.pointerEvents = "auto";
      button.style.transformOrigin = "center center";
      button.style.transform = `translate3d(${startDx}px, ${startDy}px, 0) scale(${initialScale})`;
      button.style.transition = "transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.85s ease";

      // Overlay for both mobile and desktop
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(4, 7, 18, 0.55)";
      overlay.style.backdropFilter = "blur(6px)";
      (overlay.style as any).WebkitBackdropFilter = "blur(6px)";
      overlay.style.zIndex = "99998"; // Must be just below wrapper
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.6s ease-out";
      overlay.style.pointerEvents = "auto"; // Block clicks beneath it
      document.body.appendChild(overlay);
      button.__overlay = overlay;
      
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });

      await wait(delayBeforeMove);

      requestAnimationFrame(() => {
        button.classList.add("is-flipped");
        button.style.transform = `translate3d(0px, 0px, 0) scale(${targetScale}) rotateZ(${(Math.random() * 4 - 2).toFixed(2)}deg)`;
        button.style.boxShadow = "0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(135, 255, 195, 0.1)";
      });

      await wait(900);
    }

    els.avatarBtn.addEventListener("click", openModal);
    els.closeModalBtn.addEventListener("click", closeModal);
    els.modalAppleBtn.addEventListener("click", eatApple);

    resetGame();
  }, [questions, onFinish]);

  return (
    <div className="rpg-theme-container" ref={containerRef}>
      <div className="app">
        <header className="hud">
          <button className="avatar-btn" id="avatarBtn" type="button" aria-label="Open character panel">
            <span className="avatar-face" id="hudAvatar" dangerouslySetInnerHTML={{ __html: "" }}></span>
            <span className="avatar-meta">
              <span className="avatar-name" id="hudName">Hero</span>
              <span className="avatar-sub">View inventory</span>
            </span>
          </button>
          <div className="hud-stats">
            <div className="hud-pill heart">❤️ <strong id="hudHp">100 / 100</strong></div>
            <div className="hud-pill coin">🪙 <strong id="hudGold">0</strong></div>
            <div className="hud-pill apple">🍎 <strong id="hudApples">0</strong></div>
          </div>
          {onQuit && (
            <button 
              type="button" 
              onClick={onQuit} 
              className="hud-pill quit-button text-[10px] sm:text-xs uppercase font-black cursor-pointer bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all h-10 px-4 border border-white/10 rounded-full flex items-center justify-center tracking-widest text-slate-300 ml-auto"
            >
              QUIT
            </button>
          )}
        </header>

        <section className="battle-panel">
          <div className="scene" id="scene">
            <div className="stars"></div>
            <div className="mist"></div>
            <div className="trees far"></div>
            <div className="trees mid"></div>
            <div className="trees near"></div>
            <div className="path"></div>
            <div className="ground"></div>

            <div className="scene-corner-name player-corner" id="playerName" style={{ display: "none" }}>Hero</div>
            <div className="scene-corner-name enemy-corner" id="enemyName" style={{ display: "none" }}>Moss Slime</div>

            <div className="fighter player" id="playerFighter">
              <div className="sprite" id="playerSprite" dangerouslySetInnerHTML={{ __html: "" }}></div>
              <div className="combo-container" id="comboContainer"></div>
            </div>

            <div className="fighter enemy" id="enemyFighter">
              <div className="enemy-mini">
                <div className="enemy-mini-text" id="enemyMiniText" style={{ fontSize: "10px", color: "white", textAlign: "center", marginBottom: "2px", fontWeight: "bold", textShadow: "0px 1px 2px black" }}></div>
                <div className="enemy-mini-track">
                  <div className="enemy-mini-fill" id="enemyMiniFill"></div>
                </div>
              </div>
              <div className="sprite" id="enemySprite" dangerouslySetInnerHTML={{ __html: "" }}></div>
            </div>

            <div className="attack-effect player" id="playerSlash">✨</div>
            <div className="attack-effect enemy" id="enemySlash">💥</div>
            <div className="damage-layer" id="damageLayer"></div>
          </div>
        </section>

        <section className="panel">
          <div className="prompt-head">
            <div id="promptImage" className="prompt-image" style={{ display: 'none' }}></div>
            <h2 className="prompt-title" id="promptTitle">Loading...</h2>
            <p className="prompt-copy" id="promptCopy">Right answer hits. Wrong answer gets hit.</p>
          </div>
          <div className="card-grid" id="cardGrid"></div>
        </section>
      </div>

      <div className="modal-backdrop" id="modalBackdrop" hidden>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className="modal-inner">
            <div className="modal-top">
              <div className="modal-avatar" id="modalAvatar" dangerouslySetInnerHTML={{ __html: "" }}></div>
              <div>
                <h3 className="modal-title" id="modalTitle">Hero</h3>
                <p className="modal-sub">Tap equipped gear to unequip. Tap backpack gear to equip.</p>
              </div>
              <button className="eat-apple-btn" id="modalAppleBtn" type="button">Eat Apple</button>
              <button className="close-btn" id="closeModalBtn" type="button">Close</button>
            </div>
            <div className="modal-stats" id="modalStats"></div>
            <section className="modal-section">
              <h4 className="section-title">Equipped</h4>
              <div className="slots-grid" id="equipmentGrid"></div>
            </section>
            <section className="modal-section">
              <h4 className="section-title">Backpack</h4>
              <div className="bag-grid" id="backpackGrid"></div>
            </section>
            <section className="modal-section">
              <h4 className="section-title">Blessings</h4>
              <div className="passive-grid" id="passiveGrid"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

function clampNumber(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeValueNoise2D(w: number, h: number, cell: number) {
  const gw = Math.ceil(w / cell) + 3;
  const gh = Math.ceil(h / cell) + 3;
  const grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i += 1) {
    grid[i] = Math.random() * 2 - 1;
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    const gy = y / cell;
    const iy = Math.floor(gy);
    const ty = smoothstep(gy - iy);
    for (let x = 0; x < w; x += 1) {
      const gx = x / cell;
      const ix = Math.floor(gx);
      const tx = smoothstep(gx - ix);
      const g00 = grid[iy * gw + ix];
      const g10 = grid[iy * gw + ix + 1];
      const g01 = grid[(iy + 1) * gw + ix];
      const g11 = grid[(iy + 1) * gw + ix + 1];
      const a = lerp(g00, g10, tx);
      const b = lerp(g01, g11, tx);
      out[y * w + x] = lerp(a, b, ty);
    }
  }
  return out;
}

function makeValueNoise1D(w: number, cell: number) {
  const gw = Math.ceil(w / cell) + 3;
  const grid = new Float32Array(gw);
  for (let i = 0; i < gw; i += 1) {
    grid[i] = Math.random() * 2 - 1;
  }
  const out = new Float32Array(w);
  for (let x = 0; x < w; x += 1) {
    const gx = x / cell;
    const ix = Math.floor(gx);
    const tx = smoothstep(gx - ix);
    out[x] = lerp(grid[ix], grid[ix + 1], tx);
  }
  return out;
}

function makeRadialSprite(size: number, stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const gctx = c.getContext("2d");
  if (!gctx) return c;
  const g = gctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  for (const stop of stops) {
    g.addColorStop(stop[0], stop[1]);
  }
  gctx.fillStyle = g;
  gctx.beginPath();
  gctx.arc(size * 0.5, size * 0.5, size * 0.5, 0, Math.PI * 2);
  gctx.fill();
  return c;
}

const burnAssets = (() => {
  let cache: Record<string, any> = {};
  return (tone = "neutral") => {
    if (cache[tone]) return cache[tone];
    
    let smokeColors: [number, string][] = [
      [0.0, "rgba(255,220,150,0.25)"],
      [0.45, "rgba(200,120,60,0.15)"],
      [1.0, "rgba(60,20,10,0)"]
    ];
    let emberColors: [number, string][] = [
      [0.0, "rgba(255,255,255,1)"],
      [0.25, "rgba(255,200,100,0.95)"],
      [0.68, "rgba(255,100,20,0.4)"],
      [1.0, "rgba(255,40,10,0)"]
    ];

    if (tone === "positive" || tone === "good") {
      smokeColors = [
        [0.0, "rgba(150,255,200,0.25)"],
        [0.45, "rgba(60,200,120,0.15)"],
        [1.0, "rgba(10,60,20,0)"]
      ];
      emberColors = [
        [0.0, "rgba(255,255,255,1)"],
        [0.25, "rgba(100,255,150,0.95)"],
        [0.68, "rgba(20,255,80,0.4)"],
        [1.0, "rgba(10,255,40,0)"]
      ];
    } else if (tone === "negative" || tone === "bad") {
       smokeColors = [
        [0.0, "rgba(255,150,150,0.25)"],
        [0.45, "rgba(200,60,60,0.15)"],
        [1.0, "rgba(60,10,10,0)"]
      ];
      emberColors = [
        [0.0, "rgba(255,255,255,1)"],
        [0.25, "rgba(255,100,100,0.95)"],
        [0.68, "rgba(255,20,20,0.4)"],
        [1.0, "rgba(255,10,10,0)"]
      ];
    } else if (tone === "legendary") {
      smokeColors = [
        [0.0, "rgba(255,230,100,0.3)"],
        [0.45, "rgba(212,175,55,0.2)"],
        [1.0, "rgba(40,30,0,0)"]
      ];
      emberColors = [
        [0.0, "rgba(255,255,255,1)"],
        [0.25, "rgba(255,215,0,0.95)"],
        [0.68, "rgba(212,175,55,0.5)"],
        [1.0, "rgba(180,140,0,0)"]
      ];
    } else if (tone === "silver") {
      smokeColors = [
        [0.0, "rgba(200,220,255,0.3)"],
        [0.45, "rgba(163,209,255,0.2)"],
        [1.0, "rgba(20,30,60,0)"]
      ];
      emberColors = [
        [0.0, "rgba(255,255,255,1)"],
        [0.25, "rgba(184,203,224,0.95)"],
        [0.68, "rgba(100,149,237,0.5)"],
        [1.0, "rgba(40,60,120,0)"]
      ];
    }

    cache[tone] = {
      smoke: makeRadialSprite(128, smokeColors),
      ember: makeRadialSprite(96, emberColors)
    };
    return cache[tone];
  };
})();

let sharedNoiseBuffer: Float32Array | null = null;
let sharedNoiseW = 0;
let sharedNoiseH = 0;

function getSharedNoise(w: number, h: number) {
  if (sharedNoiseBuffer && sharedNoiseW === w && sharedNoiseH === h) return sharedNoiseBuffer;
  const noiseLarge = makeValueNoise2D(w, h, 54);
  const noiseMain = makeValueNoise2D(w, h, 28);
  const noiseDetail = makeValueNoise2D(w, h, 14);
  const combined = new Float32Array(w * h);
  for (let i = 0; i < combined.length; i++) {
    combined[i] = noiseLarge[i] * 24 + noiseMain[i] * 14 + noiseDetail[i] * 6;
  }
  sharedNoiseW = w;
  sharedNoiseH = h;
  sharedNoiseBuffer = combined;
  return combined;
}

function cloneCanvasElement(sourceCanvas: HTMLCanvasElement) {
  const copy = document.createElement("canvas");
  copy.width = sourceCanvas.width;
  copy.height = sourceCanvas.height;
  const copyCtx = copy.getContext("2d", { alpha: true });
  copyCtx?.clearRect(0, 0, copy.width, copy.height);
  copyCtx?.drawImage(sourceCanvas, 0, 0);
  return copy;
}

function makeBurnAnimator(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, tone: string = "neutral") {
  const ctx = targetCanvas.getContext("2d", { alpha: true });
  if (!ctx) return { start: async () => {} };
  (ctx as any).desynchronized = true;

  const W = sourceCanvas.width;
  const H = sourceCanvas.height;

  const sourceCtx = sourceCanvas.getContext("2d", { alpha: true });
  if (!sourceCtx) return { start: async () => {} };
  const sourceImageData = sourceCtx.getImageData(0, 0, W, H);
  const sourcePixels = sourceImageData.data;

  const frameImageData = ctx.createImageData(W, H);
  const framePixels = frameImageData.data;

  const assets = burnAssets(tone);
  const smokeSprite = assets.smoke;
  const emberGlowSprite = assets.ember;

  const frontierMap = new Float32Array(W);

  let progress = 0;
  let burning = true;
  let done = false;
  let lastTime = 0;
  let floatT = 0;

  let embers: any[] = [];
  let smoke: any[] = [];

  let noiseCombined: Float32Array | null = null;
  let columnNoiseA: Float32Array | null = null;
  let columnNoiseB: Float32Array | null = null;
  let profile: any = null;

  function buildProfile() {
    profile = {
      columnCellA: rand(18, 34),
      columnCellB: rand(42, 76),
      edgeAmpA: rand(5, 18),
      edgeAmpB: rand(3, 12),
      edgeAmpC: rand(2, 8),
      freqA: rand(0.030, 0.085),
      freqB: rand(0.010, 0.032),
      freqC: rand(0.090, 0.220),
      speedA: rand(0.0030, 0.0080),
      speedB: rand(0.0016, 0.0048),
      speedC: rand(0.0080, 0.0200),
      phaseA: rand(0, Math.PI * 2),
      phaseB: rand(0, Math.PI * 2),
      phaseC: rand(0, Math.PI * 2),
      columnAmpA: rand(12, 28),
      columnAmpB: rand(8, 18),
      slant: rand(-0.18, 0.18),
      bow: rand(-20, 20),
      glowBand: rand(18, 28),
      charBand: rand(36, 52),
      emberBurst: rand(1.5, 2.2),
      flameBoost: rand(1.4, 2.0)
    };

    noiseCombined = getSharedNoise(W, H);

    columnNoiseA = makeValueNoise1D(W, profile.columnCellA);
    columnNoiseB = makeValueNoise1D(W, profile.columnCellB);
  }

  function getFrontierY(x: number, t: number) {
    const nx = x / (W - 1);
    const center = nx - 0.5;

    const base = H + 44 - progress * (H + 92);
    const slant = center * profile.slant * H;
    const bow = profile.bow * (1 - Math.abs(center) * 2);

    const wobbleA = Math.sin(t * profile.speedA + x * profile.freqA + profile.phaseA) * profile.edgeAmpA;
    const wobbleB = Math.sin(t * profile.speedB + x * profile.freqB + profile.phaseB) * profile.edgeAmpB;
    const wobbleC = Math.sin(t * profile.speedC + x * profile.freqC + profile.phaseC) * profile.edgeAmpC;

    const noiseWiggle = columnNoiseA![x] * profile.columnAmpA + columnNoiseB![x] * profile.columnAmpB;

    return base + slant + bow + wobbleA + wobbleB + wobbleC + noiseWiggle;
  }

  function updateFrontierMap(t: number) {
    for (let x = 0; x < W; x += 1) {
      frontierMap[x] = getFrontierY(x, t);
    }
  }

  function spawnParticles() {
    if (!burning || done) return;

    const count = Math.max(8, Math.round((8 + progress * 8) * profile.emberBurst));

    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * W;
      const y = frontierMap[x | 0];

      if (y < -30 || y > H + 20) continue;

      embers.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.5 - Math.random() * 3.5,
        size: 1.5 + Math.random() * 3.5,
        life: 25 + Math.random() * 35,
        maxLife: 25 + Math.random() * 35,
        glow: Math.random() * 0.8 + 0.5
      });

      if (Math.random() < 0.25) {
        smoke.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y - 4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3 - Math.random() * 0.8,
          size: 10 + Math.random() * 12,
          grow: 0.15 + Math.random() * 0.25,
          life: 30 + Math.random() * 40,
          maxLife: 30 + Math.random() * 40
        });
      }
    }
  }

  function updateParticles(dt: number) {
    const step = dt * 0.06;

    for (let i = embers.length - 1; i >= 0; i -= 1) {
      const p = embers[i];
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += 0.01 * step;
      p.life -= step;
      if (p.life <= 0) embers.splice(i, 1);
    }

    for (let i = smoke.length - 1; i >= 0; i -= 1) {
      const p = smoke[i];
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.size += p.grow * step;
      p.life -= step;
      if (p.life <= 0) smoke.splice(i, 1);
    }
  }

  function drawSmoke() {
    ctx!.save();
    ctx!.globalCompositeOperation = "screen";

    for (const p of smoke) {
      const alpha = clampNumber(p.life / p.maxLife, 0, 1) * 0.85;
      const d = p.size * 2;
      ctx!.globalAlpha = alpha;
      ctx!.drawImage(smokeSprite, p.x - p.size, p.y - p.size, d, d);
    }

    ctx!.restore();
    ctx!.globalAlpha = 1;
  }

  function drawEmbers() {
    ctx!.save();
    ctx!.globalCompositeOperation = "screen";

    for (const p of embers) {
      const life = clampNumber(p.life / p.maxLife, 0, 1);
      const glow = p.size * (2.2 + p.glow * 1.5);
      const d = glow * 2;

      ctx!.globalAlpha = life * 0.95;
      ctx!.drawImage(emberGlowSprite, p.x - glow, p.y - glow, d, d);

      ctx!.globalAlpha = life * 0.85;
      ctx!.fillStyle = "rgba(255,245,220,1)";
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fill();
    }

    ctx!.restore();
    ctx!.globalAlpha = 1;
  }

  function drawFlameFront(t: number) {
    if (progress <= 0 || done) return;

    const points: [number, number][] = [];
    for (let x = 0; x <= W; x += 8) {
      points.push([x, frontierMap[Math.min(W - 1, x)]]);
    }

    ctx!.save();
    ctx!.globalCompositeOperation = "screen";

    ctx!.beginPath();
    ctx!.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      ctx!.lineTo(points[i][0], points[i][1]);
    }

    const isPositive = tone === "positive" || tone === "good";
    const isNegative = tone === "negative" || tone === "bad";

    // Outer thick glow
    ctx!.lineWidth = 24;
    ctx!.strokeStyle = isPositive ? "rgba(26, 255, 94, 0.28)" : (isNegative ? "rgba(255, 26, 26, 0.28)" : "rgba(255, 94, 26, 0.28)");
    ctx!.shadowBlur = 25;
    ctx!.shadowColor = isPositive ? "rgba(26, 255, 94, 0.45)" : (isNegative ? "rgba(255, 26, 26, 0.45)" : "rgba(255, 94, 26, 0.45)");
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      ctx!.lineTo(points[i][0], points[i][1]);
    }

    // Main line core
    ctx!.lineWidth = 8;
    ctx!.strokeStyle = isPositive ? "rgba(73, 255, 182, 0.8)" : (isNegative ? "rgba(255, 40, 40, 0.8)" : "rgba(255, 182, 73, 0.8)");
    ctx!.shadowBlur = 15;
    ctx!.shadowColor = isPositive ? "rgba(51, 255, 174, 0.6)" : (isNegative ? "rgba(255, 40, 40, 0.6)" : "rgba(255, 174, 51, 0.6)");
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      ctx!.lineTo(points[i][0], points[i][1]);
    }

    // White hot inner core
    ctx!.lineWidth = 3;
    ctx!.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx!.shadowBlur = 5;
    ctx!.shadowColor = "rgba(255, 255, 255, 1)";
    ctx!.stroke();

    ctx!.shadowBlur = 0;

    for (let x = 0; x < W; x += 24) {
      const y = frontierMap[x];
      if (y < -30 || y > H + 20) continue;

      const flameH = (
        12 +
        (Math.sin(t * 0.02 + x * 0.31 + profile.phaseA) * 0.5 + 0.5) * 16 +
        progress * 12
      ) * profile.flameBoost;

      const flameW = 8 + (Math.sin(t * 0.017 + x * 0.12 + profile.phaseB) * 0.5 + 0.5) * 6;

      ctx!.fillStyle = isPositive ? "rgba(46, 255, 128, 0.45)" : (isNegative ? "rgba(255, 46, 46, 0.45)" : "rgba(255, 128, 46, 0.45)");
      ctx!.beginPath();
      ctx!.moveTo(x - flameW, y + 2);
      ctx!.quadraticCurveTo(x - flameW * 0.2, y - flameH * 0.6, x, y - flameH);
      ctx!.quadraticCurveTo(x + flameW * 0.2, y - flameH * 0.55, x + flameW, y + 2);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = isPositive ? "rgba(120, 255, 214, 0.35)" : (isNegative ? "rgba(255, 120, 120, 0.35)" : "rgba(255, 214, 120, 0.35)");
      ctx!.beginPath();
      ctx!.moveTo(x - flameW * 0.45, y + 1);
      ctx!.quadraticCurveTo(x - flameW * 0.1, y - flameH * 0.48, x, y - flameH * 0.72);
      ctx!.quadraticCurveTo(x + flameW * 0.1, y - flameH * 0.46, x + flameW * 0.45, y + 1);
      ctx!.closePath();
      ctx!.fill();
    }

    ctx!.restore();
  }

  function renderBurnFrame() {
    framePixels.fill(0);

    let minY = H;
    let maxY = 0;
    for (let x = 0; x < W; x++) {
      const fy = frontierMap[x];
      if (fy < minY) minY = fy;
      if (fy > maxY) maxY = fy;
    }

    const startY = Math.max(0, Math.floor(minY - profile.charBand - 15));
    const endY = Math.min(H, Math.ceil(maxY + 15));

    // Copy original pixels below startY directly since they are untouched by fire
    if (startY > 0) {
      const endRow = startY * W * 4;
      framePixels.set(sourcePixels.subarray(0, endRow), 0);
    }

    for (let y = startY; y < endY; y += 1) {
      const row = y * W;

      for (let x = 0; x < W; x += 1) {
        const pixelIndex = row + x;
        const i = pixelIndex * 4;
        const alpha = sourcePixels[i + 3];

        if (alpha === 0) continue;

        const field = y - frontierMap[x] + noiseCombined![pixelIndex];

        if (field > 0) {
          continue; // burned away
        }

        let r = sourcePixels[i];
        let g = sourcePixels[i + 1];
        let b = sourcePixels[i + 2];
        let a = alpha;

        if (field > -profile.glowBand) {
          const edge = 1 - ((-field) / profile.glowBand);
          const glow = edge * edge * edge; // faster than Math.pow(edge, 0.75) conceptually if we use a simple power, let's just use edge*edge

          // Magical hot burn
          if (tone === "positive" || tone === "good") {
            r = r * (1 - glow) + 50 * glow;
            g = g * (1 - glow * 0.7) + 255 * glow;
            b = b * (1 - glow * 0.9) + 75 * glow;
          } else if (tone === "negative" || tone === "bad") {
            r = r * (1 - glow) + 255 * glow;
            g = g * (1 - glow * 0.7) + 30 * glow;
            b = b * (1 - glow * 0.9) + 30 * glow;
          } else {
            r = r * (1 - glow) + 255 * glow;
            g = g * (1 - glow * 0.7) + 225 * glow;
            b = b * (1 - glow * 0.9) + 75 * glow;
          }
          a = a * (1 - glow * 0.1);
        } else if (field > -profile.charBand) {
          const charAmt = 1 - Math.min(1, Math.max(0, ((-field) - profile.glowBand) / (profile.charBand - profile.glowBand)));
          r *= 1 - charAmt * 0.3;
          g *= 1 - charAmt * 0.4;
          b *= 1 - charAmt * 0.5;
        }

        framePixels[i] = r;
        framePixels[i + 1] = g;
        framePixels[i + 2] = b;
        framePixels[i + 3] = a;
      }
    }

    ctx!.clearRect(0, 0, W, H);
    ctx!.putImageData(frameImageData, 0, 0);
  }

  return {
    start() {
      buildProfile();

      return new Promise<void>((resolve) => {
        function loop(now: number) {
          const dt = Math.min(32, now - lastTime || 16.67);
          lastTime = now;
          floatT += dt;

          if (burning && !done) {
            progress += dt * 0.00142;

            if (progress >= 1.08) {
              progress = 1.08;
              burning = false;
              done = true;
            }
          }

          updateFrontierMap(floatT);
          spawnParticles();
          updateParticles(dt);
          renderBurnFrame();
          drawSmoke();
          drawFlameFront(floatT);
          drawEmbers();

          if (burning || embers.length > 0 || smoke.length > 0) {
            requestAnimationFrame(loop);
          } else {
            ctx!.clearRect(0, 0, W, H);
            resolve();
          }
        }

        lastTime = performance.now();
        requestAnimationFrame(loop);
      });
    }
  };
}
