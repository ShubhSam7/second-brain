import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./Input";

export default function CreateContentModel({ open, onClose }: any) {
  return (
    <div>
      {open && (
        <div className="flex fixed bg-black/60 backdrop-blur-sm w-full h-full top-0 left-0 justify-center items-center z-50 animate-fade-in">
          <div className="bg-surface border border-border-muted rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary tracking-wide">Add Content</h3>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-accent-primary transition-colors duration-300"
              >
                <CrossIcon />
              </button>
            </div>
            <div className="space-y-4">
              <Input placeholder="Content Link" type="text" />
              <Input placeholder="Content Type" type="text" />
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="primary" text="Submit" size="md"></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


