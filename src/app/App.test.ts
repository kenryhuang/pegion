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
  it('refreshes HP when the same game state object is mutated and re-emitted', async () => {
    const wrapper = mount(App);
    const state = createGameState('hud-hp');
    state.mode = 'running';

    window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('HP 100 / 100');

    state.player.hp = 91;
    window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('HP 91 / 100');
  });
});
