import { json } from '@sveltejs/kit';
import { supabase } from '$lib/db/supabase';

export async function GET() {
	const { data, error } = await supabase
		.from('gifts')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
}

export async function POST({ request }: { request: Request }) {
	const body = await request.json();
	const { title, description, link, price, image_url } = body;

	const { data, error } = await supabase
		.from('gifts')
		.insert([{ title, description, link, price, image_url, status: 'available' }])
		.select();
	if (error) return json({ error: error.message }, { status: 500 });
	return json(data[0], { status: 201 });
}
