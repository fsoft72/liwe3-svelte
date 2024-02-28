export type UserAuth = {
	uid: string;
	email?: string;
	name?: string;
	avatar?: string;
	perms?: string[];  // Record<string, string[]>;
	token?: string;
	username?: string;
};
