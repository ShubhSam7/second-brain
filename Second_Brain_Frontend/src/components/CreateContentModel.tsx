import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./Input";

export default function CreateContentModel({ open, onClose }: any) {
  return (
    <div>
      {open && (
        <div className="flex fixed bg-gray-500 opacity-70 w-full h-full t-0 l-0 justify-center">
          <div className="flex justify-center flex-col">
            <span className="bg-white opacity-100  p-4 rounded-md ">
              <div className="flex justify-end">
                <div onClick={onClose}>
                  <CrossIcon />
                </div>
              </div>
              <div>
                <Input placeholder="link" />
                <Input placeholder="type" />
              </div>
              <div className="flex justify-center">
                <Button variant="primary" text="Submit" size="sm"></Button>
              </div>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


