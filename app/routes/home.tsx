import { redirect } from "react-router";

export function loader() {
  return redirect("/share", 301);
}
