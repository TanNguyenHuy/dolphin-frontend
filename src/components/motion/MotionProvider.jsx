import { useSyncExternalStore } from 'react';
import { MotionContext } from './motion';

const media = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const subscribe = (listener) => {
    const query = media();
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
};
const getSnapshot = () => media().matches;
const getServerSnapshot = () => true;

export default function MotionProvider({ reduced, children }) {
    const systemReduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return <MotionContext.Provider value={reduced || systemReduced}>{children}</MotionContext.Provider>;
}
