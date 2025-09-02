import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";

interface Style {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "other";
}

export default function Card({ title, link, type }: Style): any {
  return (
    <div className="w-90 h-[350px] bg-white border border-gray-200 shadow-md rounded-xl flex flex-col gap-3 p-4 overflow-hidden">
      <div className=" flex justify-between items-center">
        <div className="text-gray-500 flex">
          <DeleteIcon />
          <div className="pl-2">{title}</div>
        </div>
        <div className="flex items-center">
          <div className="text-gray-500 pr-3">
            <a href={link} target="_blank">
              <ShareIcon />
            </a>
          </div>
          <div className="text-gray-500">
            <DeleteIcon />
          </div>
        </div>
      </div>
      {/* //embed the frame */}
      <div className="pt-4">
        {type === "youtube" && (
          <div className="aspect-video w-full mt-4">
            <iframe
              className="w-full h-[240px] rounded-md"
              src={link.replace("watch?v=", "embed/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {type === "twitter" && (
          <div className="h-[280px] overflow-auto">
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}
