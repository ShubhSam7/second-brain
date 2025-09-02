import { Button } from "../components/Button";
import { Input } from "../components/Input";
export default function Signin() {
  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded border min-w-48 ">
        <div className="font-bold m-3">
            Sign In
        </div>
        <Input placeholder="Username" type="text"></Input>
        <Input placeholder="Password" type="password"></Input>
        <div className="flex justify-center items-center m-4">
          <Button variant="primary" size="md" text="Signin" full = {true}></Button>
        </div>
      </div>
    </div>
  );
}
