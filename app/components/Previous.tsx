import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <></>
    // <div className="z-50 absolute  md:top-[8%]  lg:left-28 md:left-24 font-sans tracking-[.4em] text-xs  lg:block  hidden">
    //   <span
    //     onClick={handleGoBack}
    //     style={{ cursor: "pointer" }}
    //     className="text-2xl"
    //   >
    //     &#8592; {/* Left arrow icon */}
    //   </span>
    // </div>
  );
}
