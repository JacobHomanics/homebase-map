import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  setUserLocation: (newUserLocation: { lat: number; lng: number }) => void;
  mapRef: any;
  setMapRef: (map: any) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: false,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes): void => set({ targetNetwork: newTargetNetwork }),
  userLocation: null,
  setUserLocation: (newUserLocation: { lat: number; lng: number }): void => set({ userLocation: newUserLocation }),
  mapRef: null,
  setMapRef: (map: any): void => set({ mapRef: map }),
}));
