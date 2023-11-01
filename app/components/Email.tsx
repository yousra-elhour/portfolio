import Link from "next/link";

export default function Email() {
  return (
    <>
      <div className="z-20 absolute bottom-10 left-[8%] right-[8%] font-sans lg:tracking-[.4em] md:tracking-[.4em] tracking-[.3em] text-xs ">
        <Link href={"mailto:elhour.yousra1910@gmail.com"}>
          elhour.yousra1910@gmail.com
        </Link>
      </div>
    </>
  );
}
