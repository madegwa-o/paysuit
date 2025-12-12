import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {History} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";


export default function Wallet() {

    return (
    <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
            <h1 className="font-bold text-3xl mb-2">Wallet Ballance</h1>
            <p className="text-muted-foreground">sh 200</p>
        </div>

        <Tabs defaultValue="sent" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="recharge">Recharge My Wallet</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="recharge" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Disbursement History
                        </CardTitle>
                        <CardDescription>View your past consultations and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent>

                        <Button variant="outline" className="w-full mt-4 bg-transparent">
                            Load More
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>


            <TabsContent value="withdraw" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Received History
                        </CardTitle>
                        <CardDescription>View your past consultations and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent>

                        <Button variant="outline" className="w-full mt-4 bg-transparent">
                            Load More
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    </main>
    )
}