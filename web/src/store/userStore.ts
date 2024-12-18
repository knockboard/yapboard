import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    token: string;
  };
  setUser: (
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    token: string
  ) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        token: "",
      },
      setUser: (
        username: string,
        email: string,
        firstname: string,
        lastname: string,
        token: string
      ) =>
        set({
          user: { username, firstname, lastname, email, token },
        }),
      clearUser: () =>
        set(() => ({
          user: {
            username: "",
            firstname: "",
            lastname: "",
            email: "",
            token: "",
          },
        })),
    }),
    {
      name: "yapboard-user",
    }
  )
);

export default useUserStore;
