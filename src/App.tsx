import { Component } from "solid-js";
import { createTrpcQuery } from "./lib/trpc";

const App: Component = () => {
  const date = new Date();
  const [data] = createTrpcQuery("hello", { text: "world" });

  return (
    <>
      <h1>Schnitzellunch.se</h1>
      {data()?.greeting ?? "Loading..."}
    </>
  );
};

export default App;
