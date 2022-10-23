
export default function Login() {
  return (
    <>
      <p className={"mb-5"}>Login to get started.</p>
      <a
        href="/api/auth/github"
        className={"btn btn-primary"}
        data-sveltekit-reload
        data-sveltekit-prefetch="off"
      >
        Login
      </a>
    </>
  );
}
