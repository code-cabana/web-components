import { Carousel } from "@codecabana/web-components";
import MainLayout from "../../../layouts/main";

export default function ESMComponent() {
  // console.log(Carousel);
  return (
    <MainLayout title="Code Cabana">
      Hi
      <codecabana-carousel />
    </MainLayout>
  );
}
