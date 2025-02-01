import { useState } from "react";
import useUserStore from "../store/userStore";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setemail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const setUser = useUserStore((state) => state.setUser);

  async function onSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.email, "", "", "", data.access_token);
        setIsLoading(false);
        window.location.href = "/app/";
      } else if (response.status === 400) {
        const data = await response.json();
        alert(data?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full px-8">
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="w-full text-xl font-bold leading-tight tracking-tight text-left text-gray-900 md:text-2xl dark:text-white">
          Sign in
        </h1>
        <form className="w-full space-y-4 md:space-y-6">
          <div className="w-full">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="name@company.com"
              required={true}
              autoComplete="off"
              onChange={(e) => setemail(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              required={true}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign in"}
          </button>
          <a
            href="/auth/sign-up/"
            className="flex items-center justify-center w-full text-sm font-light text-gray-500 dark:text-gray-400"
          >
            <span className="font-medium text-right cursor-pointer text-primary-600 hover:underline dark:text-primary-500">
              Don’t have an account yet? Sign up
            </span>
          </a>
        </form>
      </div>
    </div>
  );
}
