import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";

interface Style {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "other";
}

export default function Card({ title, link, type }: Style): any {
  return (
    <div className="w-90 h-[350px] bg-surface border border-border-muted shadow-xl rounded-xl flex flex-col gap-3 p-4 overflow-hidden hover:border-accent-primary/30 transition-all duration-300 group">
      <div className="flex justify-between items-center">
        <div className="text-text-secondary flex items-center">
          <DeleteIcon />
          <div className="pl-2">{title}</div>
        </div>
        <div className="flex items-center gap-3">
          <a href={link} target="_blank" className="text-text-secondary hover:text-accent-primary transition-colors duration-300">
            <ShareIcon />
          </a>
          <button className="text-text-secondary hover:text-red-400 transition-colors duration-300">
            <DeleteIcon />
          </button>
        </div>
      </div>
      {/* //embed the frame */}
      <div className="pt-4">
        {type === "youtube" && (
          <div className="aspect-video w-full mt-4">
            <iframe
              className="w-full h-[240px] rounded-lg border border-border-muted"
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
