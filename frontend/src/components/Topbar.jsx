export default function Topbar({ user }) {
  const userName =
    user?.name
      ? user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase()
      : "User";

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="welcome-text text-xl font-semibold">
          Welcome back, <span className="font-bold text-2xl">{userName}</span>!
        </h1>

        <p className="welcome-subtext">
          Here&apos;s what&apos;s happening with your learning today.
        </p>
      </div>
    </div>
  );
}