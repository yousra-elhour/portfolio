import Link from "next/link";

export default function Nav() {
  return (
    <>
      <div className="z-50 absolute top-[12%] md:top-[15%]  lg:right-20 md:right-12 font-sans tracking-[.4em] text-xs -rotate-90 lg:block  hidden ">
        <Link href={"/"}>MENU</Link>
      </div>
    </>
  );
}
