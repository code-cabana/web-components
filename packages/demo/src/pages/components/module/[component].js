// import dynamic from "next/dynamic";
import MainLayout from "../../../layouts/main";
// const Carousel = dynamic(() => import("../../../blocks/test"), {
//   ssr: false,
// });
import Carousel from "@codecabana/web-components";

export default function ESMComponent() {
  return (
    <MainLayout title="Code Cabana">
      Hi
      <Carousel />
    </MainLayout>
  );
}
