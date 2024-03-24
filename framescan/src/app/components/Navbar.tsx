import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="flex fixed justify-between items-center w-full h-14 border-b px-8 z-10 bg-violet-400">
            <Link href="/">
                <div className="flex h-full items-center">
                    <span className="text-xl text-white tracking-widest">
                        Framescan
                    </span>
                </div>
            </Link>
            <div className="flex h-full items-center">
                <Link href="/rankings">
                    <span className="text-base text-white tracking-wide">
                        Leaderboard
                    </span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
