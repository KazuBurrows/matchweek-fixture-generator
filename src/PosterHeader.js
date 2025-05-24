import { images } from "./Base64Images";

function PosterHeader({ competition, week }) {
  return (
    <div className="absolute h-[1200px] w-[1000px] text-center pt-2">
        <img src={images.mainland} className="w-[120px] mx-auto"/>
        <h1 className="uppercase text-white inter-font text-[100px] font-black leading-none tracking-tighter mt-[-20px]">{competition}</h1>
        <h1 className="uppercase text-red-800 inter-font text-[30px] font-black leading-none tracking-tighter mt-[5px]">{week}</h1>
    </div>
  );
}

export default PosterHeader;
