export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.D1V4ieUb.js",app:"_app/immutable/entry/app.DHu9ORQp.js",imports:["_app/immutable/entry/start.D1V4ieUb.js","_app/immutable/chunks/Ba5fVipB.js","_app/immutable/chunks/CL3P19wm.js","_app/immutable/chunks/TIIH6dp5.js","_app/immutable/entry/app.DHu9ORQp.js","_app/immutable/chunks/Ba5fVipB.js","_app/immutable/chunks/B1BsKmJo.js","_app/immutable/chunks/CODUQDk-.js","_app/immutable/chunks/TIIH6dp5.js","_app/immutable/chunks/C7G-7vB_.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/gifts",
				pattern: /^\/api\/gifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/gifts/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
