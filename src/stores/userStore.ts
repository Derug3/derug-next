import { create } from "zustand";
import { IUserData } from "../interface/user.interface";

export interface IUserStore {
  userData: IUserData | undefined;
  setUserData: (user: IUserData | undefined) => void;
}

const initalState = {
  userData: undefined,
};

export const userStore = create<IUserStore>((set, get) => ({
  ...initalState,
  setUserData: (userData: IUserData | undefined) => set({ userData }),
}));
