import style from "@/components/logo/style.module.scss";
import { useRouter } from "next/router";

export default function Logo() {
  const router = useRouter();
  return (
    <div className={style.logo} onClick={() => router.push("/")}>
      dib
    </div>
  );
}
