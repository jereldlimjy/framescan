import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="flex fixed w-full h-14 border-b px-8">
            <Link href="/">
                <div className="flex h-full items-center">
                    <span className="text-xl">Framescan</span>
                </div>
            </Link>
        </nav>
    );
};

export default Navbar;
