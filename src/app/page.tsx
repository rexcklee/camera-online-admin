"use client";

import API from "@/apis/api";

const auth = new API();

export default async function Home() {
  return (
    <div className="m-10">
      <h1 className="text-center mb-4">Home page!</h1>
    </div>
  );
}
