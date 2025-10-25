function DefaultLogo({ user }) {
  // Use optional chaining and fallback safely
  const firstLetter = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      {firstLetter}
    </div>
  );
}

export default DefaultLogo;
