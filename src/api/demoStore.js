import { createDemoSeed, DEMO_STORAGE_KEY } from './demoSeed';

const clone = (value) => JSON.parse(JSON.stringify(value));

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

export const getDemoStore = () => {
  if (!canUseStorage()) return createDemoSeed();

  const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) {
    const seed = createDemoSeed();
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const seed = createDemoSeed();
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

export const saveDemoStore = (store) => {
  if (canUseStorage()) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
  }
  return store;
};

export const resetDemoStore = () => {
  const seed = createDemoSeed();
  saveDemoStore(seed);
  return seed;
};

export const updateDemoStore = (updater) => {
  const store = getDemoStore();
  const result = updater(store) || store;
  return saveDemoStore(result);
};

export const nextDemoId = (store, key = 'generic') => {
  if (!store.meta) store.meta = { nextIds: {} };
  if (!store.meta.nextIds) store.meta.nextIds = {};
  const next = store.meta.nextIds[key] || 1;
  store.meta.nextIds[key] = next + 1;
  return next;
};

export const copyDemoStore = () => clone(getDemoStore());

export const deepClone = clone;
