type BreakerState = {
  consecutiveFailures: number;
  openUntilMs: number;
  lastFailureAt?: string;
};

const state: BreakerState = {
  consecutiveFailures: 0,
  openUntilMs: 0,
};

export function circuitIsOpen(): boolean {
  return Date.now() < state.openUntilMs;
}

export function circuitSnapshot(): BreakerState {
  return { ...state };
}

export function circuitRecordSuccess() {
  state.consecutiveFailures = 0;
  state.openUntilMs = 0;
  state.lastFailureAt = undefined;
}

export function circuitRecordFailure(params?: { cooldownMs?: number }) {
  state.consecutiveFailures += 1;
  state.lastFailureAt = new Date().toISOString();
  const cooldownMs = params?.cooldownMs ?? 60_000;
  const penalty = Math.min(10, state.consecutiveFailures);
  state.openUntilMs = Date.now() + cooldownMs * penalty;
}

