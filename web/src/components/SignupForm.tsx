import { useState } from "react";
import useUserStore from "../store/userStore";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const setUser = useUserStore((state) => state.setUser);

  async function onSubmit() {
    if (!email || !password) {
      alert("Fill all fields.");
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        setIsLoading(false);
        const data = await response.json();
        setUser(data.email, "", "", "", data.access_token);
        window.location.href = "/app/";
      } else if (response.status === 400) {
        setIsLoading(false);
        const data = await response.json();
        console.log(data);
        if (data?.message) {
          //
        }
      }
    } catch (error) {
      console.log("error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full px-8">
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="w-full text-xl font-bold leading-tight tracking-tight text-left text-gray-900 md:text-2xl dark:text-white">
          Sign Up
        </h1>
        <form className="w-full space-y-4 md:space-y-6">
          <div className="w-full">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@company.com"
              required={true}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
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
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            {isLoading ? "Loading..." : "Sign up"}
          </button>
          <a
            href="/auth/sign-in/"
            className="flex items-center justify-center w-full text-sm font-light text-gray-500 dark:text-gray-400"
          >
            <span className="font-medium text-right cursor-pointer text-primary-600 hover:underline dark:text-primary-500">
              Already have an account? Sign in
            </span>
          </a>
        </form>
      </div>
    </div>
  );
}
