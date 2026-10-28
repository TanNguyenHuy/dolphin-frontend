import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS } from '../../settings';

export const AppearanceContext = createContext(DEFAULT_SETTINGS);
export const useAppearance = () => useContext(AppearanceContext);
