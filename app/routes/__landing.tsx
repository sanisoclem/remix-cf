import { Outlet } from "@remix-run/react";

export default function Landing() {
  return (
    <>
      <div className={"min-h-screen bg-gray-900 text-white"}>
        <main>
          <div
            className={"hero min-h-screen"}
            style={{ backgroundImage: 'url(https://placeimg.com/1000/800/arch)' }}
          >
            <div className={"hero-overlay bg-opacity-90"} />
            <div className={"hero-content text-center text-neutral-content"}>
              <div className={"max-w-md"}>
                <h1 className={"mb-5 text-5xl font-bold"}>Empire Builder</h1>
                <p className={"mb-2"}>Provident cupiditate voluptatem et in. Poopap papop.</p>
                <Outlet />
              </div>
            </div>
          </div>
        </main>
        <footer />
      </div>
    </>
  );
}
