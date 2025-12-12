// ============================================
// models/User.ts
// ============================================
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

export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password?: string;
	image?: string;
	phone?: string;
	address?: string;
	roles: Role[];
	accountType: AccountType;
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;

	comparePassword(candidate: string): Promise<boolean>;
	hasRole(role: Role): boolean;
	addRole(role: Role): void;
	removeRole(role: Role): void;
}

const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [50, "Name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
			index: true,
		},
		password: {
			type: String,
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		image: {
			type: String,
			default: null,
		},
		phone: {
			type: String,
			trim: true,
			default: null,
		},
		address: {
			type: String,
			trim: true,
			default: null,
		},
		roles: {
			type: [String],
			enum: Object.values(Role),
			default: [Role.USER],
			index: true,
			validate: {
				validator: function(v: string[]) {
					return v.length > 0;
				},
				message: "User must have at least one role",
			},
		},
		accountType: {
			type: String,
			enum: Object.values(AccountType),
			default: AccountType.FREEMIUM,
			index: true,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		lastLogin: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
			transform: (_, ret) => {
				delete ret.password;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
			transform: (_, ret) => {
				delete ret.password;
				return ret;
			},
		},
	}
);


// 📇 Compound indexes for common queries
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ roles: 1, accountType: 1 });

// 🔒 Hash password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password") || !this.password) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

// 🧠 Password comparison
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
	if (!this.password) return false;
	return bcrypt.compare(candidate, this.password);
};

// 🧩 Role management methods
UserSchema.methods.hasRole = function (role: Role): boolean {
	return this.roles.includes(role);
};

UserSchema.methods.addRole = function (role: Role): void {
	if (!this.roles.includes(role)) {
		this.roles.push(role);
	}
};

UserSchema.methods.removeRole = function (role: Role): void {
	this.roles = this.roles.filter((r: Role) => r !== role);
};

// 🚀 Export
export const User = models.User || model<IUser>("User", UserSchema);