import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import { gameEventNames, type GameStateUpdatedDetail } from '../game/events/GameEvents';
import { createGameState } from '../game/state/GameState';

vi.mock('../game/main', () => ({
  createPhaserGame: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}));

describe('App HUD updates', () => {
  it('refreshes localized health when the same game state object is mutated and re-emitted', async () => {
    const wrapper = mount(App);
    const state = createGameState('hud-hp');
    state.mode = 'running';

    window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('生命 100 / 100');
    expect(wrapper.text()).toContain('击杀 0');

    state.player.hp = 91;
    window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('生命 91 / 100');
  });

  it('shows a top boss health bar with exact values while a boss is active', async () => {
    const wrapper = mount(App);
    const state = createGameState('boss-hud');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'clown_boss',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 34 },
      hp: 1500,
      maxHp: 1500,
      speed: 86,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 1,
      activeWarning: null,
    });

    window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.boss-health').exists()).toBe(true);
    expect(wrapper.text()).toContain('1500 / 1500');
  });
});
