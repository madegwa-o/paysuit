import { connectToDatabase } from "./db"
import { User, type IUser } from "@/models/User"


export async function updateUserPassword(email: string, password: string): Promise<IUser | null> {
    await connectToDatabase()
    const user = await User.findOne({ email })
    if (!user) return null

    user.password = password
    await user.save()
    return user
}
