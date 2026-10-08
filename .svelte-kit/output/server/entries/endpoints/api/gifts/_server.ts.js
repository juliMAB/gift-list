import { json } from "@sveltejs/kit";
import { s as supabase } from "../../../../chunks/supabase.js";
async function GET() {
  const { data, error } = await supabase.from("gifts").select("*").order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, { status: 500 });
  return json(data);
}
async function POST(request) {
  const body = await request.json();
  const { title, description, link, price, image_url } = body;
  const { data, error } = await supabase.from("gifts").insert([{ title, description, link, price, image_url, status: "available" }]).select();
  if (error) return json({ error: error.message }, { status: 500 });
  return json(data[0], { status: 201 });
}
export {
  GET,
  POST
};
