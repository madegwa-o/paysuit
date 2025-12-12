
type User = {
    id: string;
    name: string;
    email: string;
    age: number;
    image?: string;
}
export default async function GET(req: Request):  Promise<User> {


    const response: User = {
        id: 'awioeniwehsrwgrg',
        name: 'john doe',
        email: 'john@gmail.com',
        age: 22,
        image: 'https://avatars0.githubusercontent.com/u/10000x100',

    }


    return response;

}