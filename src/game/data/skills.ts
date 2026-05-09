export type SkillBranch = 'office' | 'kitchen' | 'magnet' | 'clone';

export type SkillEffect =
  | { type: 'projectile_homing'; amount: number }
  | { type: 'stun_chance'; amount: number }
  | { type: 'pierce'; amount: number }
  | { type: 'aura_damage'; amount: number; radius: number }
  | { type: 'elite_boss_damage'; amount: number }
  | { type: 'burst_projectiles'; amount: number }
  | { type: 'bounce'; amount: number }
  | { type: 'burn'; damage: number; duration: number; radius: number }
  | { type: 'shield_interval'; seconds: number }
  | { type: 'burn_radius'; amount: number }
  | { type: 'burn_slow'; amount: number }
  | { type: 'aoe_stun'; damage: number; radius: number }
  | { type: 'pickup_radius'; amount: number }
  | { type: 'enemy_drift'; amount: number }
  | { type: 'dash_pickup'; radius: number }
  | { type: 'pull_pulse'; radius: number; strength: number }
  | { type: 'global_magnet'; radius: number }
  | { type: 'clone_spawn'; interval: number }
  | { type: 'clone_inherit'; amount: number }
  | { type: 'lethal_guard'; amount: number }
  | { type: 'clone_limit'; amount: number }
  | { type: 'clone_burst'; damage: number }
  | { type: 'clone_swarm'; amount: number };

export interface SkillNode {
  id: string;
  name: string;
  branch: SkillBranch;
  tier: number;
  prerequisites: string[];
  branchPointRequirement: number;
  effects: SkillEffect[];
  description: string;
}

export const SKILL_TREE: SkillNode[] = [
  { id: 'office_paperclip', name: 'Paperclip Rounds', branch: 'office', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'projectile_homing', amount: 0.18 }], description: 'Projectiles lightly track nearby targets.' },
  { id: 'office_stapler', name: 'Stapler Burst', branch: 'office', tier: 2, prerequisites: ['office_paperclip'], branchPointRequirement: 1, effects: [{ type: 'stun_chance', amount: 0.12 }], description: 'Hits can briefly stun small enemies.' },
  { id: 'office_folder_pierce', name: 'Folder Pierce', branch: 'office', tier: 3, prerequisites: ['office_stapler'], branchPointRequirement: 2, effects: [{ type: 'pierce', amount: 1 }], description: 'Projectiles pierce one extra enemy.' },
  { id: 'office_shredder_field', name: 'Shredder Field', branch: 'office', tier: 4, prerequisites: ['office_folder_pierce'], branchPointRequirement: 3, effects: [{ type: 'aura_damage', amount: 8, radius: 92 }], description: 'A small damage field surrounds the player.' },
  { id: 'office_overtime_notice', name: 'Overtime Notice', branch: 'office', tier: 5, prerequisites: ['office_shredder_field'], branchPointRequirement: 4, effects: [{ type: 'elite_boss_damage', amount: 0.2 }], description: 'Attacks hit elites and bosses harder.' },
  { id: 'office_quarterly_storm', name: 'Quarterly Storm', branch: 'office', tier: 6, prerequisites: ['office_overtime_notice'], branchPointRequirement: 5, effects: [{ type: 'burst_projectiles', amount: 12 }], description: 'Periodically releases radial file projectiles.' },
  { id: 'kitchen_pan', name: 'Pan Ricochet', branch: 'kitchen', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'bounce', amount: 1 }], description: 'Attacks bounce between enemies.' },
  { id: 'kitchen_chili', name: 'Chili Puddle', branch: 'kitchen', tier: 2, prerequisites: ['kitchen_pan'], branchPointRequirement: 1, effects: [{ type: 'burn', damage: 5, duration: 2, radius: 48 }], description: 'Hits leave burning puddles.' },
  { id: 'kitchen_fridge_shield', name: 'Fridge Door Shield', branch: 'kitchen', tier: 3, prerequisites: ['kitchen_chili'], branchPointRequirement: 2, effects: [{ type: 'shield_interval', seconds: 12 }], description: 'Periodically blocks one hit.' },
  { id: 'kitchen_smoke_spread', name: 'Smoke Spread', branch: 'kitchen', tier: 4, prerequisites: ['kitchen_chili'], branchPointRequirement: 3, effects: [{ type: 'burn_radius', amount: 24 }], description: 'Burning areas grow wider.' },
  { id: 'kitchen_frozen_leftovers', name: 'Frozen Leftovers', branch: 'kitchen', tier: 5, prerequisites: ['kitchen_smoke_spread'], branchPointRequirement: 4, effects: [{ type: 'burn_slow', amount: 0.25 }], description: 'Burning enemies are slowed.' },
  { id: 'kitchen_microwave_overload', name: 'Microwave Overload', branch: 'kitchen', tier: 6, prerequisites: ['kitchen_frozen_leftovers'], branchPointRequirement: 5, effects: [{ type: 'aoe_stun', damage: 70, radius: 220 }], description: 'Releases a wide stunning blast.' },
  { id: 'magnet_xp_pull', name: 'XP Pull', branch: 'magnet', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'pickup_radius', amount: 60 }], description: 'Increases pickup radius.' },
  { id: 'magnet_bullets', name: 'Magnetic Rounds', branch: 'magnet', tier: 2, prerequisites: ['magnet_xp_pull'], branchPointRequirement: 1, effects: [{ type: 'projectile_homing', amount: 0.12 }], description: 'Projectiles bend toward enemies.' },
  { id: 'magnet_enemy_drift', name: 'Mob Drift', branch: 'magnet', tier: 3, prerequisites: ['magnet_bullets'], branchPointRequirement: 2, effects: [{ type: 'enemy_drift', amount: 0.15 }], description: 'Nearby small enemies drift off course.' },
  { id: 'magnet_dash_pickup', name: 'Dash Pickup', branch: 'magnet', tier: 4, prerequisites: ['magnet_enemy_drift'], branchPointRequirement: 3, effects: [{ type: 'dash_pickup', radius: 120 }], description: 'Dash pulls XP near its path.' },
  { id: 'magnet_pull_pulse', name: 'Pull Coil', branch: 'magnet', tier: 5, prerequisites: ['magnet_dash_pickup'], branchPointRequirement: 4, effects: [{ type: 'pull_pulse', radius: 180, strength: 120 }], description: 'Pulses pull small enemies together.' },
  { id: 'magnet_global_pull', name: 'Full Field Pull', branch: 'magnet', tier: 6, prerequisites: ['magnet_pull_pulse'], branchPointRequirement: 5, effects: [{ type: 'global_magnet', radius: 900 }], description: 'Pulls distant XP and releases a shockwave.' },
  { id: 'clone_temporary', name: 'Temporary Clone', branch: 'clone', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'clone_spawn', interval: 10 }], description: 'Periodically creates a short-lived clone.' },
  { id: 'clone_inherit', name: 'Inherited Office Drama', branch: 'clone', tier: 2, prerequisites: ['clone_temporary'], branchPointRequirement: 1, effects: [{ type: 'clone_inherit', amount: 0.35 }], description: 'Clones inherit part of your attack upgrades.' },
  { id: 'clone_guard', name: 'Substitute Save', branch: 'clone', tier: 3, prerequisites: ['clone_inherit'], branchPointRequirement: 2, effects: [{ type: 'lethal_guard', amount: 1 }], description: 'A clone can block fatal damage.' },
  { id: 'clone_meeting_limit', name: 'Meeting Capacity', branch: 'clone', tier: 4, prerequisites: ['clone_guard'], branchPointRequirement: 3, effects: [{ type: 'clone_limit', amount: 1 }], description: 'Raises the clone limit.' },
  { id: 'clone_burst', name: 'Clone Burst', branch: 'clone', tier: 5, prerequisites: ['clone_meeting_limit'], branchPointRequirement: 4, effects: [{ type: 'clone_burst', damage: 30 }], description: 'Clones explode when they expire.' },
  { id: 'clone_swarm', name: 'Too Many Meetings', branch: 'clone', tier: 6, prerequisites: ['clone_burst'], branchPointRequirement: 5, effects: [{ type: 'clone_swarm', amount: 5 }], description: 'Summons a swarm focused on elites and bosses.' },
];
