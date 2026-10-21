import { Schema, model, models, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";

export enum Role {
	ADMIN = "ADMIN",
	MERCHANT = "MERCHANT",
	USER = "USER",
}

export enum AccountType {
	PREMIUM = "PREMIUM",
	FREEMIUM = "FREEMIUM",
}

export enum AuthProvider {
	EMAIL = "email",
	GOOGLE = "google",
}

export interface IDarajaEnv {
	consumerKey?: string;
	consumerSecret?: string;
	passkey?: string;
	initiatorName?: string;
	shortCode?: string;
}

export interface IUser extends Document {
	_id: Types.ObjectId;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	imageUrl?: string;
	phoneNumbers: string[];
	address?: string;
	googleId?: string;
	authProvider: AuthProvider;
	emailVerified: boolean;
	isProfileComplete: boolean;
	roles: Role[];
	isActive: boolean;
	accountType: AccountType;
	walletBalance: number;
	accountBalance: number;
	lastLogin?: Date | null;
	darajaCredentials?: { sandbox?: IDarajaEnv; production?: IDarajaEnv };
	createdAt: Date;
	updatedAt: Date;
	name: string; // virtual

	comparePassword(candidate: string): Promise<boolean>;
	hasRole(role: Role): boolean;
	addRole(role: Role): void;
	removeRole(role: Role): void;
}

const phonePattern = /^\+?[0-9 ()-]{7,20}$/; // same as Go

const darajaEnv = {
	consumerKey: { type: String, default: "", select: false },
	consumerSecret: { type: String, default: "", select: false },
	passkey: { type: String, default: "", select: false },
	initiatorName: { type: String, default: "", select: false },
	shortCode: { type: String, default: "", select: false },
};

const UserSchema = new Schema<IUser>(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			lowercase: true, // authorize() lowercases the identifier
			trim: true,
			minlength: [3, "Username must be at least 3 characters"],
			maxlength: [30, "Username cannot exceed 30 characters"],
			match: [/^[a-z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and dots"],
		},
		firstName: {
			type: String,
			trim: true,
			maxlength: [50, "Name cannot exceed 50 characters"],
			default: "",
			// Google may not return a name until the profile is completed
			required: [function (this: IUser) { return this.isProfileComplete; }, "First name is required"],
		},
		lastName: {
			type: String,
			trim: true,
			maxlength: [50, "Name cannot exceed 50 characters"],
			default: "",
			required: [function (this: IUser) { return this.isProfileComplete; }, "Last name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
		},
		password: {
			type: String,
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		imageUrl: { type: String, trim: true },
		phoneNumbers: {
			type: [String],
			default: [],
			validate: {
				validator: (v: string[]) => v.every((p) => phonePattern.test(p)),
				message: "Invalid phone number",
			},
		},
		address: { type: String, trim: true },
		googleId: { type: String, unique: true, sparse: true }, // absent for email-only users
		authProvider: {
			type: String,
			enum: Object.values(AuthProvider),
			default: AuthProvider.EMAIL,
		},
		emailVerified: { type: Boolean, default: false },
		isProfileComplete: { type: Boolean, default: false },
		roles: {
			type: [{ type: String, enum: Object.values(Role) }],
			default: [Role.USER],
			validate: {
				validator: (v: string[]) => v.length > 0,
				message: "User must have at least one role",
			},
		},
		isActive: { type: Boolean, default: true },
		accountType: {
			type: String,
			enum: Object.values(AccountType),
			default: AccountType.FREEMIUM,
		},
		walletBalance: { type: Number, default: 0, min: 0 },
		accountBalance: { type: Number, default: 0, min: 0 },
		lastLogin: { type: Date, default: null },
		darajaCredentials: {
			sandbox: darajaEnv,
			production: darajaEnv,
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true, transform: strip },
		toObject: { virtuals: true, transform: strip },
	}
);

function strip(_: unknown, ret: Record<string, unknown>) {
	delete ret.password;
	delete ret.darajaCredentials;
	return ret;
}

UserSchema.virtual("name").get(function (this: IUser) {
	return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ roles: 1, accountType: 1 });

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password") || !this.password) return next();
	try {
		// cost 10 matches Go's PasswordCost, and bcrypt hashes are
		// interchangeable between bcryptjs and golang.org/x/crypto/bcrypt
		this.password = await bcrypt.hash(this.password, 10);
		next();
	} catch (error) {
		next(error as Error);
	}
});

UserSchema.methods.comparePassword = async function (candidate: string) {
	if (!this.password) return false;
	return bcrypt.compare(candidate, this.password);
};
UserSchema.methods.hasRole = function (role: Role) { return this.roles.includes(role); };
UserSchema.methods.addRole = function (role: Role) {
	if (!this.roles.includes(role)) this.roles.push(role);
};
UserSchema.methods.removeRole = function (role: Role) {
	this.roles = this.roles.filter((r: Role) => r !== role);
};

export const User = models.User || model<IUser>("User", UserSchema);