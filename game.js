/**
 * Fantasy President — Narrative-Driven 2D Adventure Game
 * UI Rendered via HTML/CSS | Canvas for Game Graphics Only
 */

// ─── GLOBAL STATE ───────────────────────────────────────────────────────────

const GAME = {
  width: 960,
  height: 640,
  flags: { elven_alliance:false, dragon_slain:false, dark_cult_tier:0, treasury:50, military:50, approval:50, arcane_favor:50, world_state:'prelude', choice_sensitivity:0, completed_arc:0, donations_received:0, scenarios_completed:0, chapter2_unlocked:false, game_over_state:null, victory_achieved:false, gate_states:{elven_gate:false, dragon_gate:false, dark_cult_gate:false} },
  stats: { treasury:50, military:50, approval:50, arcane_favor:50 },
  scenarios: [],
  scenarioIndex: 0,
  dialog: null,
  party: [],
  npc: { x:10, y:8, name:'Elder Mira', dialogue:['The weight of the realm rests on your shoulders, President.','The Crown is in jeopardy. Dark forces gather in the shadows.','You must decide the fate of Aethelgard.'] },
  player: { x:6, y:6, hp:100, maxHp:100, name:'President', title:'The Sovereign' },
  gameState: 'title',
  keys: {}, moveQueue: [], saveKey:'fantasy_president_save', money:0, totalDonations:0,
  autoUpdater: { enabled:true, lastRun:null, month:null, streak:0, phase:'research' }
};

// ─── SCENARIO DECK (Full 40-Scenario Production Deck) ──────────────────────

const SCENARIOS_DATA = [
  { id:'sc_001', title:'The Council Conspiracy', text:'The Council of Factions meets in secret. You suspect the Dark Cult is pulling the strings behind the scenes. The meeting room smells of ozone and old parchment. Three faceless elders sit around the table, their eyes hidden in shadow.', flags:{dark_cult_tier:1}, stats:{treasury:0, military:50, approval:-5, arcane_favor:5}, choices:{'A':'Investigate the conspiracy quietly — probe the council\'s files.','B':'Publicly denounce the Council — risk a scandal but expose the truth.','C':'Align with the Northern Coalition for support — trade sovereignty for strength.'}, outcome:{text:'The council meets in shadow. The truth begins to surface. You feel the weight of the secret pressing down on you, but the path forward is now visible.', next:'sc_002', stats:{treasury:0, military:50, approval:-5, arcane_favor:5}, flags:{dark_cult_tier:1}}, dependencies:{flags:{elven_alliance:false}}},
  { id:'sc_002', title:'The Secret Cabinet', text:'The Secret Cabinet of the Arcane is meeting with the High Priest of the Dark Cult. They discuss restoring arcane resonance through dangerous rituals. The air in the room grows heavy. You have a choice to make.', flags:{dark_cult_tier:2}, stats:{treasury:0, military:40, approval:-10, arcane_favor:10}, choices:{'A':'Support the Cabinet — the ritual may save the kingdom.','B':'Oppose the Cabinet — the Arcane Council will be angry.','C':'Investigate secretly — uncover the truth before deciding.'}, outcome:{text:'The Cabinet\'s plan is revealed. The arcane resonance is growing unstable, and you must decide how to respond. The shadows are deepening.', next:'sc_003', stats:{treasury:0, military:40, approval:-10, arcane_favor:10}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:false}}},
  { id:'sc_003', title:'The Dark Cult\'s Plan', text:'The Dark Cult has established a base in the Shadow Woods. Their High Priest is gathering forces, and the kingdom\'s defenses are weakening. The signs are everywhere: blank stare, whispers in the dark, and unnatural thunderstorms.', flags:{dark_cult_tier:2}, stats:{treasury:-50, military:30, approval:-10, arcane_favor:5}, choices:{'A':'Deploy the Northern Coalition\'s forces to contain the threat.','B':'Raise a volunteer militia and defend the capital.','C':'Seek the High Priest\'s counsel — he says he has a plan to save everyone.'}, outcome:{text:'The Dark Cult\'s plan is now public knowledge. The kingdom must choose its fate. Dark clouds gather over the capital.', next:'sc_004', stats:{treasury:-50, military:30, approval:-10, arcane_favor:5}, flags:{dragon_slain:false}}},
  { id:'sc_004', title:'The Northern Coalition\'s Ambitions', text:'Bardon Ironheart demands your support. His forces are modern, his agenda clear: modernizing the kingdom\'s military, expanding the treasury, and dominating the northern border. But his loyalty is questionable.', flags:{elven_alliance:false}, stats:{treasury:-20, military:50, approval:-5, arcane_favor:5}, choices:{'A':'Accept his funds — but demand concessions on military control.','B':'Refuse — the Northern Coalition will resent the rejection.','C':'Demand he share arcane knowledge as part of the deal.'}, outcome:{text:'The Northern Coalition grows stronger. The kingdom\'s economy improves, but the political cost is steep. Ironheart watches you closely.', next:'sc_005', stats:{treasury:-20, military:50, approval:-5, arcane_favor:5}, flags:{elven_alliance:false}}},
  { id:'sc_005', title:'The Royal Palace\'s Secret', text:'The Royal Palace is the source of the Crown\'s power. The walls hum with arcane energy, the halls whisper secrets, and the throne room feels different from anything you\'ve seen before. Something ancient stirs.', flags:{dragon_slain:false}, stats:{treasury:0, military:50, approval:-5, arcane_favor:5}, choices:{'A':'Explore the palace — discover the truth about the Crown\'s ancient power.','B':'Order containment — guard the palace and prevent any secrets from leaking.','C':'Govern in the open — rule as a normal citizen, not through ancient power.'}, outcome:{text:'The Royal Palace\'s secret is now yours. The Crown\'s power is real, but so are the dangers. A decision must be made.', next:'sc_006', stats:{treasury:0, military:50, approval:-5, arcane_favor:5}, flags:{dragon_slain:false}}},
  { id:'sc_006', title:'The Elven Council Request', text:'The Elven Confederacy requests your support against the Dark Cult. Their high priestess, Queen Morwen, speaks through the trees. The Elven forests are the last line of defense against arcane pollution.', flags:{elven_alliance:true}, stats:{treasury:0, military:50, approval:-5, arcane_favor:10}, choices:{'A':'Accept their alliance — the Elves and Crown are stronger together.','B':'Maintain neutrality — the war is between the Elves and Dark Cult.','C':'Demand tribute for their aid — protect the kingdom\'s treasury.'}, outcome:{text:'The Elven Confederacy agrees to an uneasy alliance. The forests are now alive with arcane resonance. The path to victory is clearer.', next:'sc_007', stats:{treasury:0, military:50, approval:-5, arcane_favor:10}, flags:{elven_alliance:true}}, dependencies:{flags:{dark_cult_tier:2}}},
  { id:'sc_007', title:'The Shadow Woods', text:'The Shadow Woods are the Dark Cult\'s stronghold. Shadows move like living things, and the air is thick with unnatural magic. The enemy waits in the deep. You must decide how to approach.', flags:{dragon_slain:false, dark_cult_tier:2}, stats:{treasury:-60, military:35, approval:-15, arcane_favor:10}, choices:{'A':'Launch a direct assault — the Shadow Woods must fall.','B':'Send a diplomatic envoy to negotiate — the Dark Cult may be persuaded.','C':'Send a scouting party — find the element of surprise.'}, outcome:{text:'The Shadow Woods are now contested. The Dark Cult is weakened, but their presence is felt everywhere. The kingdom\'s fate hangs in the balance.', next:'sc_008', stats:{treasury:-60, military:35, approval:-15, arcane_favor:10}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_008', title:'The Arcane Favor Crisis', text:'Arcane Favor is declining across the kingdom. Magic is failing — springs dry up, constructs lose their form, and the people feel the pull of the metaphysical fading. The cause is unknown.', flags:{arcane_favor:30}, stats:{treasury:0, military:50, approval:-5, arcane_favor:-10}, choices:{'A':'Investigate the Arcane Council — the ritual sites are failing.','B':'Consult the High Priest of the Dark — he knows how to restore arcane power.','C':'Advocate for traditional magic — the ancient ways may hold the answer.'}, outcome:{text:'The Arcane Favor crisis is now your biggest challenge. The kingdom\'s magic is failing, and the cause is deep in the earth. The path to resolution is unclear.', next:'sc_009', stats:{treasury:0, military:50, approval:-5, arcane_favor:-10}, flags:{arcane_favor:30}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_009', title:'The Northern Coal Mines', text:'The Northern Coal Mines are the kingdom\'s economic engine. The Dark Cult has infiltrated the mines, manipulating the workers and corrupting the ore. The mines are a disaster zone, and the people are suffering.', flags:{treasury:70}, stats:{treasury:70, military:50, approval:-10, arcane_favor:0}, choices:{'A':'Ordering the mines to halt operations — the arcane contamination must stop.','B':'Firing the suspected workers and resuming production.','C':'Sending a team of arcane investigators to analyze the contamination.'}, outcome:{text:'The Northern Coal Mines are contaminated. The kingdom\'s economy is tied to the mines, and the people are suffering. The arcane threat is growing.', next:'sc_010', stats:{treasury:70, military:50, approval:-10, arcane_favor:0}, flags:{treasury:70}}},
  { id:'sc_010', title:'The Crown\'s Fate', text:'The Crown is at a crossroads. The Dark Cult has grown stronger. The Elves have offered their alliance. The Northern Coalition demands more. You must decide: which path will you take?', flags:{dark_cult_tier:2, elven_alliance:true}, stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, choices:{'A':'Align with the Elves — the forest path is the only way forward.','B':'Maintain the Crown\'s independence — rule without factions.','C':'Seek a coalition — the Northern Coalition and Elves together.'}, outcome:{text:'The Crown\'s fate has been decided. Your choices have shaped the realm. The next arc awaits.', next:'sc_011', stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, flags:{dark_cult_tier:2, elven_alliance:true}}},
  { id:'sc_011', title:'The Shadow Alliance', text:'The Shadow Alliance is a secret pact between the Dark Cult, the Northern Coalition, and the Arcane Council. The three factions are moving in lockstep, and the kingdom is caught in the middle. You must decide which side to back.', flags:{dark_cult_tier:2}, stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, choices:{'A':'Expose the Shadow Alliance — the world needs to know.','B':'Join the alliance — power is power.','C':'Shatter the alliance — work with the Elves to crush the cult.'}, outcome:{text:'The Shadow Alliance is revealed. The factions are in chaos. The player must choose the next move carefully.', next:'sc_012', stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_012', title:'The Mountain Fortress', text:'The Dark Cult\'s Mountain Fortress is the heart of their power. The walls are reinforced with arcane crystals, and the high priest\'s army is near invincible. Only a daring plan can breach the stronghold.', flags:{dark_cult_tier:2}, stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, choices:{'A':'Assault the fortress from the front — a direct, bloody assault.','B':'Send a deep-cover team — infiltrate and destroy the source.','C':'Negotiate a truce — the High Priest may accept terms.'}, outcome:{text:'The Mountain Fortress is now threatened. The Dark Cult\'s hold on the kingdom is weakening. The path forward is clear.', next:'sc_013', stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_013', title:'The Northern Industrial District', text:'The Northern Industrial District is where the modern machines of war are built. The Northern Coalition controls the district, and the Dark Cult is trying to influence the workers through the unions. The economy is tight.', flags:{treasury:40}, stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, choices:{'A':'Seize the district — control it completely for the kingdom.','B':'Negotiate with the Northern Coalition — keep the status quo.','C':'Empower the unions — the workers need protection from the cultists.'}, outcome:{text:'The Northern Industrial District is now under your control. The economy is improving, but the political landscape is shifting. The kingdom is changing.', next:'sc_014', stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, flags:{treasury:40}}},
  { id:'sc_014', title:'The Royal Palace\'s Secret', text:'The Royal Palace is the source of power. The secrets are beyond what the Crown has ever revealed. You must decide: rule the palace directly, or open the palace to the public and reveal its true nature.', flags:{dark_cult_tier:2}, stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, choices:{'A':'Guard the palace — keep the secrets hidden from the people.','B':'Open the palace — rule as a transparent leader, with nothing to hide.','C':'Close the palace — control the narrative, the people must not know.'}, outcome:{text:'The Royal Palace\'s secret is now in your hands. The people\'s trust is a fragile thing. The next arc is closer.', next:'sc_015', stats:{treasury:40, military:45, approval:-10, arcane_favor:15}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_015', title:'The Arcane Favor Ritual', text:'The Arcane Council proposes a ritual to restore arcane resonance. The ritual is dangerous, and the cost may be high. The High Priest of the Dark is already watching your every move. The ritual is your only hope.', flags:{arcane_favor:30}, stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, choices:{'A':'Proceed with the ritual — the arcane resonance can be restored.','B':'Investigate first — the ritual may have unforeseen consequences.','C':'Ignore the ritual — the kingdom has survived without it.'}, outcome:{text:'The Arcane Favor ritual is now underway. The kingdom holds its breath. The outcome will determine the fate of magic itself.', next:'sc_016', stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, flags:{arcane_favor:30}}},
  { id:'sc_016', title:'The Dark Cult\'s Betrayal', text:'The Dark Cult has betrayed the Northern Coalition. They have taken control of the Mountain Fortress and the mines. The Northern Coalition is now powerless against the cult\'s arcane armies. The rebellion has begun.', flags:{dark_cult_tier:2}, stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, choices:{'A':'Raise a rebellion — the cult must be defeated no matter the cost.','B':'Seek the Elven Confederacy\'s aid — they know the arcane arts.','C':'Negotiate with the Northern Coalition — they have resources.'}, outcome:{text:'The Dark Cult has betrayed the Northern Coalition. The kingdom\'s military strength is now reduced. The fight for the realm continues.', next:'sc_017', stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, flags:{dark_cult_tier:2}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_017', title:'The Palace Assassination', text:'The High Priest of the Dark sends a silent assassin to the Royal Palace. The assassin is close. The Queen, the generals, the diplomats — all are in the palace. This could be the end of the Crown.', flags:{dark_cult_tier:2}, stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, choices:{'A':'Dismiss the threat — the palace security is adequate.','B':'Close the palace — no one enters. The assassination will fail.','C':'Welcome the assassin — let them in. Trust your instincts.'}, outcome:{text:'The Royal Palace is now under threat. An assassination attempt is near. The Crown is at its most vulnerable. A decision must be made.', next:'sc_018', stats:{treasury:70, military:45, approval:-15, arcane_favor:-5}, flags:{dark_cult_tier:2}}},
  { id:'sc_018', title:'The Secret Cabinet\'s Fall', text:'The Secret Cabinet has fallen. The Arcane Council has been purged. The dark ritual is complete. The kingdom\'s future is now in the hands of the Dark Cult\'s High Priest. You must decide the next step.', flags:{dark_cult_tier:2, arcane_favor:30}, stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Declare martial law — the kingdom needs order, and you are the law.','B':'Act as a neutral mediator — the factions need a channel.','C':'Retire to the shadows — let the world burn, let the strong survive.'}, outcome:{text:'The Secret Cabinet has fallen. The Arcane Council is dead. The kingdom is now ruled by the Darkness. A new era begins.', next:'sc_019', stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, flags:{dark_cult_tier:2}}},
  { id:'sc_019', title:'The Northern Occupation', text:'The Northern Occupation is the most dangerous threat. The Northern Coalition has taken control of the kingdom\'s borders and the Arcane Council. The cities are under martial law. The rebels are organizing.', flags:{dark_cult_tier:2, military:45}, stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Organize a resistance — the North cannot rule forever.','B':'Accept the occupation — the people need stability.','C':'Seek the Elven Confederacy\'s aid — they will not leave you alone.'}, outcome:{text:'The Northern Occupation is now public. The kingdom\'s resistance is growing. The Dark Cult\'s plans are unraveling. A new war is brewing.', next:'sc_020', stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, flags:{military:45}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_020', title:'The Vow of the Crown', text:'The Crown is a sacred oath. The King and Queen made a vow to protect the realm. The Dark Cult seeks to break that vow. To preserve the Crown, you must decide whether to uphold the oath or break it.', flags:{dark_cult_tier:2}, stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Uphold the oath — no matter the cost, the Crown must be preserved.','B':'Break the oath — the Crown has failed, and you must take power.','C':'Seek the Elven aid — the Elves will help you uphold the crown.'}, outcome:{text:'The Crown\'s vow is now a matter of life and death. The Dark Cult is desperate. The kingdom\'s fate hangs in the balance.', next:'sc_021', stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, flags:{dark_cult_tier:2}}},
  { id:'sc_021', title:'The Mountain\'s Fall', text:'The Dark Cult has built a mountain fortress, and you stand at the foot of it. The mountain wall is reinforced with arcane crystals, and the High Priest\'s army is awaiting your approach. The fortress must fall.', flags:{dark_cult_tier:2}, stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Charge the mountain walls — a direct, suicidal assault.','B':'Devise a plan — use the arcane to blind the enemy.','C':'Call a truce — the High Priest may agree to terms.'}, outcome:{text:'The Mountain Fortress is now at your command. The Dark Cult is defeated. The king is safe, but the kingdom must be rebuilt.', next:'sc_022', stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, flags:{dark_cult_tier:2}}},
  { id:'sc_022', title:'The Northern Campaign', text:'The Northern Campaign is the second great battle of the war. The Northern Coalition\'s army is large, and the Dark Cult\'s forces are growing. The outcome will decide the fate of the kingdom. You must take the battle to the North.', flags:{dark_cult_tier:2, military:45}, stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Deploy the entire army — the war must end now.','B':'Use guerrilla tactics — strike where the enemy least expects.','C':'Divide and conquer — send a contingent to the North, another to the Mountain.'}, outcome:{text:'The Northern Campaign is won. The Dark Cult\'s forces are shattered. The kingdom is safe, but the cost has been high. The people are weary.', next:'sc_023', stats:{treasury:70, military:45, approval:-15, arcane_favor:30}, flags:{military:45}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_023', title:'The Royal Treasury', text:'The Royal Treasury is the last great asset of the Crown. The Dark Cult has been defeated, the Northern occupation is over, and the Elves have joined the alliance. The kingdom\'s wealth is secure, but the people are poor.', flags:{treasury:40, elven_alliance:true}, stats:{treasury:40, military:45, approval:-15, arcane_favor:30}, choices:{'A':'Distribute the treasury — the people need the wealth, now.','B':'Keep the treasury — the state must fund its own defense.','C':'Invest in the Northern Coalition — strengthen the kingdom\'s economy.'}, outcome:{text:'The Royal Treasury is now a matter of national debate. The kingdom\'s wealth is secure, but the people\'s poverty is a lingering wound.', next:'sc_024', stats:{treasury:40, military:45, approval:-15, arcane_favor:30}, flags:{treasury:40}}},
  { id:'sc_024', title:'The Arcane Favor Pact', text:'The Arcane Favor Pact is signed. The Elves and Crown have agreed to share the arcane ritual. The High Priest of the Dark has been defeated. The realm is at peace. The King is safe, the kingdom is prosperous, and the people are hopeful.', flags:{arcane_favor:30, elven_alliance:true}, stats:{treasury:40, military:45, approval:50, arcane_favor:30}, choices:{'A':'Uphold the pact — the arcane ritual will restore the realm.','B':'Reject the pact — the kingdom does not need the Arcane Council.','C':'Seek new alliances — the Northern Coalition has been weakened.'}, outcome:{text:'The Arcane Favor Pact is signed. The kingdom\'s magic is restored. The Crown is secure. The realm enters a new era.', next:'sc_025', stats:{treasury:40, military:45, approval:50, arcane_favor:30}, flags:{arcane_favor:30, elven_alliance:true}}},
  { id:'sc_025', title:'The Shadow of the Crown', text:'The shadow of the Crown lingers. The Dark Cult is defeated, but the loss of the Secret Cabinet and the Northern Coalition has left the kingdom weakened. The people are weary. The realm needs healing.', flags:{dark_cult_tier:2, approval:50}, stats:{treasury:40, military:45, approval:50, arcane_favor:30}, choices:{'A':'Seek the Elven counsel — they will guide the kingdom.','B':'Rebuild the Crown — the people need a symbol of hope.','C':'Form a new council — the old factions are dead.'}, outcome:{text:'The Shadow of the Crown lingers. The realm is at peace, but the wounds of war are deep. The king is safe, but the kingdom must heal. A new era begins.', next:'sc_026', stats:{treasury:40, military:45, approval:50, arcane_favor:30}, flags:{dark_cult_tier:2, approval:50}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_026', title:'The Crown\'s Legacy — A New Era', text:'The Crown\'s Legacy is a new beginning. The Dark Cult is defeated. The Northern Coalition is broken. The Elves have helped. The King is at peace. But the kingdom must forge a new path.', flags:{elven_alliance:true, approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Rebuild the Crown — restore the old order.','B':'Form a new government — the old factions are dead.','C':'Rule through the Arcane Council — the arcane is the way forward.'}, outcome:{text:'The Crown\'s Legacy is now secure. The kingdom is at peace. The reign of the Crown begins anew. The realm is prosperous.', next:'sc_027', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{elven_alliance:true}}},
  { id:'sc_027', title:'The Elven Forest\'s Secret', text:'The Elven Forest holds ancient secrets. The Arcane Council has found a way to restore arcane resonance. The kingdom\'s magic is returning. The Elves are the guardians of the knowledge. The king must decide whether to trust them.', flags:{elven_alliance:true, arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Trust the Elves — share the secrets; the arcane will grow.','B':'Keep the Elves at arm\'s length — they are secretive by nature.','C':'Seek the Northern expertise — the industrialists may know your secret.'}, outcome:{text:'The Elven Forest\'s secret is now known. The kingdom\'s arcane resonance is growing. The Elves are essential allies. The realm is stable.', next:'sc_028', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{elven_alliance:true, arcane_favor:50}}, dependencies:{flags:{elven_alliance:true}}},
  { id:'sc_028', title:'The Northern Coalition\'s Revival', text:'The Northern Coalition is reviving. Bardon Ironheart has returned from the shadows. The kingdom has been through war, and the North is rebuilding. The new Northern Coalition seeks to modernize. The king must decide whether to trust them.', flags:{dark_cult_tier:2, approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Accept the Northern Coalition\'s help — they know the modern world.','B':'Keep the North independent — the kingdom must stand alone.','C':'Seek a compromise — the King\'s advisors will negotiate.'}, outcome:{text:'The Northern Coalition is reviving. The kingdom\'s economy is growing. The King must decide whether to trust them. The realm is stable.', next:'sc_029', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{dark_cult_tier:2, approval:50}}},
  { id:'sc_029', title:'The Secret Cabinet\'s Return', text:'The Secret Cabinet has returned. The Arcane Council is now restored, and the High Priest of the Dark is defeated. The King must decide how to use the Arcane Council\'s power. The kingdom\'s magic is growing.', flags:{dark_cult_tier:2, arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Let the Arcane Council rule — they are the experts.','B':'Keep the Arcane Council at a distance — the people trust you.','C':'Merge the Council with the Crown — the kingship is restored.'}, outcome:{text:'The Secret Cabinet has returned. The Arcane Council is back in power. The kingdom\'s arcane resonance is growing. The realm is prosperous.', next:'sc_030', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{dark_cult_tier:2, arcane_favor:50}}},
  { id:'sc_030', title:'The Northern Campaign\'s End', text:'The Northern Campaign is over. The Northern Coalition is defeated, but their forces are still strong. The Kingdom must decide what to do with the North. The King must decide: rule the North, or leave them alone.', flags:{military:50, approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Rule the North — the kingdom must expand.','B':'Leave the North alone — the kingdom must focus on defense.','C':'Negotiate — the North will join only if given power.'}, outcome:{text:'The Northern Campaign is over. The kingdom is secure. The King has decided the fate of the North. The realm is at peace.', next:'sc_031', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{military:50, approval:50}}},
  { id:'sc_031', title:'The Arcane Favor Crisis — Resolved', text:'The Arcane Favor Crisis is resolved. The Arcane Council has restored the kingdom\'s magic. The people are hopeful. The king must decide how to use the Arcane Council\'s power. The realm is now at its peak.', flags:{arcane_favor:50, approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Summon the Helmsman — the Arcane Council will guide the kingdom.','B':'Keep the Council at arm\'s length — the people trust you.','C':'Merge the Council with the Crown — the kingship is restored.'}, outcome:{text:'The Arcane Favor Crisis is resolved. The kingdom\'s magic is restored. The Arcane Council is the source of strength. The realm is stable.', next:'sc_032', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{arcane_favor:50, approval:50}}},
  { id:'sc_032', title:'The Crown\'s Old Enemy', text:'The Crown\'s old enemy has returned. The Northern Coalition\'s Bardon Ironheart is back, and he seeks vengeance. The kingdom must decide whether to fight or negotiate. The North is restless.', flags:{approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Declare war — the North must be stopped.','B':'Negotiate — Ironheart is a former ally.','C':'Seek a compromise — the King\'s advisors will guide you.'}, outcome:{text:'The Crown\'s old enemy has returned. The kingdom\'s economy is stable. The King must decide the fate of the North. The realm is at peace.', next:'sc_033', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{approval:50}}},
  { id:'sc_033', title:'The Royal Palace\'s Secret — The Throne Room', text:'The Royal Palace\'s secret is the Throne Room. The Throne Room is the source of the Crown\'s power. The arcane resonance is growing. The King must decide whether to preserve or restore the throne.', flags:{arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Rebuild the Throne Room — restore the Crown\'s power.','B':'Keep the Throne Room closed — the people need to know the truth.','C':'Open the Throne Room — the king will be the people\'s symbol.'}, outcome:{text:'The Royal Palace\'s secret is now public. The Throne Room is restored. The Crown\'s power is secure. The realm is stable.', next:'sc_034', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{arcane_favor:50}}},
  { id:'sc_034', title:'The Northern Campaign\'s Aftermath', text:'The Northern Campaign is over. The Northern Coalition is defeated, but the cost has been high. The kingdom must rebuild. The people need a leader. The King must decide whether to rule, or to sacrifice himself.', flags:{approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Rule from the North — the kingdom must expand.','B':'Retire to the palace — the people need a symbol.','C':'Sacrifice the crown — the palace will be the seat of power.'}, outcome:{text:'The Northern Campaign is over. The kingdom is safe. The King has made his decision. The realm is at peace. The Crown is secure.', next:'sc_035', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{approval:50}}},
  { id:'sc_035', title:'The Northern Industrial District — The Final Stand', text:'The Northern Industrial District is the last major battle of the war. The Northern Coalition\'s last resistance is here. The King must decide whether to fight, or to negotiate. The kingdom must choose its fate.', flags:{approval:50, arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Fight to the end — the war is not over until it is.','B':'Negotiate — the North will join if given a role.','C':'Retreat — the kingdom must focus on rebuilding.'}, outcome:{text:'The Northern Campaign is over. The kingdom is secure. The King has decided the fate of the North. The realm is at peace.', next:'sc_036', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{approval:50, arcane_favor:50}}},
  { id:'sc_036', title:'The Crown\'s Tributary', text:'The Crown\'s Tributary is the final blow. The Northern Coalition is defeated. The Kingdom will rule the North. The King must decide whether to tax the North, or to give it a voice in the realm.', flags:{treasury:50, approval:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Tax the North — the kingdom will be rich.','B':'Give the North a voice — the realm will be strong.','C':'Consent the North — the Kingdom will be united.'}, outcome:{text:'The Crown\'s Tributary is decided. The kingdom will rule the North. The King has made his choice. The realm is secure.', next:'sc_037', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{treasury:50, approval:50}}},
  { id:'sc_037', title:'The King\'s Secret', text:'The King\'s Secret is the final piece. The King has the power of the Arcane Council. The kingdom is secure. The people must now know: the King is more than a figurehead. The truth will change everything.', flags:{arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Keep the secret — the kingdom will be stable.','B':'Reveal the truth — the King is a god-king.','C':'Merge the secret with the Crown — the kingship is restored.'}, outcome:{text:'The King\'s Secret is revealed. The kingdom is stable. The King has made his choice. The realm is at peace. The Crown is secure.', next:'sc_038', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{arcane_favor:50}}},
  { id:'sc_038', title:'The Final Convergence', text:'The Final Convergence is the moment of truth. The two great powers—the Arcane Council and the Crown—have converged. The King must decide how to unite them. The kingdom\'s future is secure.', flags:{arcane_favor:50}, stats:{treasury:50, military:50, approval:50, arcane_favor:50}, choices:{'A':'Merge the powers — the kingship is restored.','B':'Keep the powers separate — the realm is stable.','C':'Form a new alliance — the North, Elves, and Crown together.'}, outcome:{text:'The Final Convergence is complete. The king is in power. The kingdom is at peace. The realm is prosperous.', next:'sc_039', stats:{treasury:50, military:50, approval:50, arcane_favor:50}, flags:{arcane_favor:50}}},
  { id:'sc_039', title:'The Crown\'s Victory', text:'The Crown wins. The Northern Coalition is defeated. The Arcane Council is restored. The Elves are allies. The King is secure. The realm is prosperous.', flags:{arcane_favor:50, approval:50}, stats:{treasury:100, military:100, approval:100, arcane_favor:100}, choices:{'A':'Rule the realm — the crown is secure.','B':'Share the power — the people rule with the king.','C':'Rule the North — the kingdom expands.'}, outcome:{text:'The Crown wins. The realm is prosperous. The king is secure. The people rejoice. Victory is achieved.', next:'sc_040', stats:{treasury:100, military:100, approval:100, arcane_favor:100}, flags:{arcane_favor:50, approval:50}}},
  { id:'sc_040', title:'The Crown\'s Legacy — Victory', text:'The Crown\'s Legacy is complete. The realm is prosperous. The king is secure. The people rejoice. Victory is achieved. The King stands as the symbol of the realm. The legacy is secure.', flags:{arcane_favor:50, approval:50}, stats:{treasury:100, military:100, approval:100, arcane_favor:100}, choices:{'A':'Rule the realm — the crown is secure.','B':'Share the power — the people rule with the king.','C':'Rule the North — the kingdom expands.'}, outcome:{text:'The Crown\'s Legacy is complete. The realm is prosperous. The king is secure. The people rejoice. Victory is achieved.', flags:{arcane_favor:100, approval:100}, victory:'victory'}}
];

// ─── TITLE SCREEN (HTML-based) ─────────────────────────────────────────────

function startTitle() {
  // Title screen is rendered via HTML/CSS in index.html
  // Canvas is used only for game world rendering (player, NPC, grid)
  GAME.gameState = 'playing';
  showMainInterface();
}

// ─── SHOW MAIN INTERFACE ────────────────────────────────────────────────────

function showMainInterface() {
  // Show the HUD and dialogue box
  const hud = document.getElementById('hud');
  const dialogueBox = document.getElementById('dialogue-box');
  
  // Show HUD always visible
  hud.style.display = 'block';
  dialogueBox.style.display = 'none';
  
  // Update HUD with current stats
  updateHUD();
  
  // Show the game canvas (game world)
  const canvasWrapper = document.getElementById('canvas-wrapper');
  canvasWrapper.style.display = 'flex';
  
  // Start the game loop
  requestAnimationFrame(main);
}

// ─── UPDATE HUD ─────────────────────────────────────────────────────────────

function updateHUD() {
  const hud = document.getElementById('hud');
  
  // Update title
  document.getElementById('menu-title').textContent = 'Fantasy President';
  
  // Update subtitle based on game state
  if (GAME.gameState === 'dialogue' && GAME.dialogue) {
    document.getElementById('menu-subtitle').textContent = 'Dialogue';
  } else {
    document.getElementById('menu-subtitle').textContent = 'Chapter 1: The Rising Crisis';
  }
  
  // Update stat displays
  const stats = GAME.stats;
  const statElements = [
    { id: 'stat-treasury', label: 'Treasury', value: Math.max(0, Math.min(100, stats.treasury)) },
    { id: 'stat-military', label: 'Military', value: Math.max(0, Math.min(100, stats.military)) },
    { id: 'stat-approval', label: 'Approval', value: Math.max(0, Math.min(100, stats.approval)) },
    { id: 'stat-arcane', label: 'Arcane', value: Math.max(0, Math.min(100, stats.arcane_favor)) }
  ];
  
  statElements.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.querySelector('.stat-value').textContent = s.value + '%';
      el.querySelector('.stat-label').textContent = s.label;
      el.className = 'stat-bar';
      const color = s.value >= 70 ? '#0f0' : s.value >= 40 ? '#ff0' : '#f00';
      el.style.background = `linear-gradient(90deg, #333, ${color})`;
    }
  });
  
  // Update inventory and money
  document.getElementById('inventory-count').textContent = '0';
  document.getElementById('money').textContent = '$' + GAME.money;
}

// ─── DIALOGUE ──────────────────────────────────────────────────────────────

function startDialogue() {
  if (GAME.dialogue !== null) {
    GAME.gameState = 'playing';
    return;
  }
  GAME.dialogue = {
    speaker: GAME.npc.name,
    lines: GAME.npc.dialogue,
    currentLine: 0,
    options: [
      { text: 'I need help again... (talk)', action: 'next' },
      { text: 'What can you do for me?', action: 'next' },
      { text: 'I am ready to help.', action: 'next' },
      { text: 'Goodbye.', action: 'close' }
    ],
    currentOption: 0,
    finished: false
  };
  GAME.gameState = 'dialogue';
  showDialogue();
}

function showDialogue() {
  const container = document.getElementById('dialogue-box');
  const textEl = document.getElementById('dialogue-text');
  const optionsEl = document.getElementById('dialogue-options');
  const hud = document.getElementById('hud');
  
  if (GAME.dialogue === null) {
    container.style.display = 'none';
    hud.style.display = 'block';
    return;
  }
  
  const d = GAME.dialogue;
  
  if (d.finished) {
    textEl.innerHTML = `<div style="text-align:center;padding:16px;">
      <p style="color:#888;margin:0;font-size:16px;">Thank you for your time, ${GAME.npc.name}.</p>
      <p style="color:#888;margin:4px 0;font-size:14px;">The path forward is clear. The world needs heroes.</p>
    </div>`;
    container.style.display = 'block';
    hud.style.display = 'none';
    return;
  }
  
  textEl.textContent = d.speaker + ': ' + d.lines[d.currentLine];
  optionsEl.innerHTML = '';
  
  d.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'dialogue-option';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      if (i === 0) {
        if (d.currentLine < d.lines.length - 1) {
          d.currentLine++;
          showDialogue();
        } else {
          d.finished = true;
          showDialogue();
        }
      } else if (i === 1) {
        d.currentLine = Math.min(d.currentLine + 1, d.lines.length - 1);
        showDialogue();
      } else if (i === 2) {
        d.currentLine = 0;
        finishDialogue();
      } else if (i === 3) {
        closeDialogue();
      }
    });
    optionsEl.appendChild(btn);
  });
  
  container.style.display = 'block';
  hud.style.display = 'none';
  
  // Scroll to the dialogue box
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDialogue() {
  GAME.gameState = 'playing';
  const container = document.getElementById('dialogue-box');
  const hud = document.getElementById('hud');
  container.style.display = 'none';
  hud.style.display = 'block';
}

// ─── GAME LOOP ───────────────────────────────────────────────────────────────

function main() {
  // Render game world on canvas (player, NPC, grid)
  drawWorld();
  
  if (GAME.gameState === 'title') return;
  if (GAME.gameState === 'wallet') return;
  if (GAME.gameState === 'dialogue' && GAME.dialogue) {
    // Dialogue handled via HTML, skip canvas draw
    requestAnimationFrame(main);
    return;
  }
  
  // Update HUD with latest stats
  updateHUD();
  
  // Redraw game world (player position changes)
  drawWorld();
  
  requestAnimationFrame(main);
}

// ─── DRAW GAME WORLD (Canvas Only) ─────────────────────────────────────────

function drawWorld() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const offsetX = canvas.style.transform ? parseFloat(canvas.style.transform.replace('px, 0px, 0px)', '')) : 0;
  const offsetY = 0;
  
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = '#2a3a2a';
  ctx.lineWidth = 1;
  const cols = GAME.cols || 20;
  const rows = GAME.cols || 15;
  const tileSize = GAME.tileSize || 40;
  
  for (let x = 0; x < cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * tileSize, 0);
    ctx.lineTo(x * tileSize, rows * tileSize);
    ctx.stroke();
  }
  for (let y = 0; y < rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * tileSize);
    ctx.lineTo(cols * tileSize, y * tileSize);
    ctx.stroke();
  }
  
  // Player
  const px = GAME.player.x * tileSize + tileSize / 2;
  const py = GAME.player.y * tileSize + tileSize / 2;
  const sx = px - offsetX;
  const sy = py - offsetY;
  
  ctx.fillStyle = '#60a0ff';
  ctx.beginPath();
  ctx.arc(sx, sy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('You', sx - 18, sy + 20);
  
  // NPC
  if (GAME.npc) {
    const npcX = GAME.npc.x * tileSize + tileSize / 2;
    const npcY = GAME.npc.y * tileSize + tileSize / 2;
    const nx = npcX - offsetX;
    const ny = npcY - offsetY;
    
    ctx.fillStyle = '#4a9a6a';
    ctx.beginPath();
    ctx.arc(nx, ny, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ddd';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('Elder Mira', nx - 30, ny - 10);
  }
}

// ─── INITIALIZATION ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Clean localStorage on fresh load
    const saved = localStorage.getItem(GAME.saveKey);
    if (saved) {
      try { localStorage.removeItem(GAME.saveKey); } catch (e) {}
    }
    
    // Set initial game state
    GAME.gameState = 'title';
    
    // Show title screen (HTML-based)
    showMainInterface();
    
    // Start game loop
    requestAnimationFrame(main);
  }, 100);
});

// ─── KEYBOARD CONTROLS ─────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  GAME.keys[e.key.toLowerCase()] = true;
  if (e.key === ' ' || e.key === 'enter') {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  GAME.keys[e.key.toLowerCase()] = false;
});
