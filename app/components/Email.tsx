import Link from "next/link";

export default function Email() {
  return (
    <>
      <div className="z-20 absolute bottom-6 sm:bottom-8 md:bottom-8 lg:bottom-10 xl:bottom-10 2xl:bottom-10 left-[8%] right-[8%] font-sans text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-xs tracking-[.06em] sm:tracking-[.08em] md:tracking-[.12em] lg:tracking-[.2em] xl:tracking-[.3em] 2xl:tracking-[.4em]">
        <Link href={"mailto:elhour.yousra1910@gmail.com"}>
          elhour.yousra1910@gmail.com
        </Link>
      </div>
    </>
  );
}
