import { createClient } from "@/utils/supabase/server"
import { LegalForm } from "./legal-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, FileText, RotateCcw } from "lucide-react"

export default async function AdminLegalPage() {
    const supabase = await createClient()

    const { data: settings } = await supabase
        .from("site_settings")
        .select("key, content")
        .in("key", ["terms_and_conditions", "privacy_policy", "return_policy"])

    const getContent = (key: string) => settings?.find(s => s.key === key)?.content || ""

    return (
        <main className="p-4 md:p-10 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                    Store Policies
                </h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">
                    Legal Management
                </p>
            </header>

            <Tabs defaultValue="terms" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap md:inline-flex border border-slate-200">
                    <TabsTrigger value="terms" className="rounded-lg px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <FileText className="w-3.5 h-3.5 mr-2" /> Terms
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-lg px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Privacy
                    </TabsTrigger>
                    <TabsTrigger value="returns" className="rounded-lg px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <RotateCcw className="w-3.5 h-3.5 mr-2" /> Returns
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="terms">
                    <LegalForm
                        settingKey="terms_and_conditions"
                        title="Terms & Conditions"
                        initialContent={getContent("terms_and_conditions")}
                    />
                </TabsContent>

                <TabsContent value="privacy">
                    <LegalForm
                        settingKey="privacy_policy"
                        title="Privacy Policy"
                        initialContent={getContent("privacy_policy")}
                    />
                </TabsContent>

                <TabsContent value="returns">
                    <LegalForm
                        settingKey="return_policy"
                        title="Return & Refund Policy"
                        initialContent={getContent("return_policy")}
                    />
                </TabsContent>
            </Tabs>
        </main>
    )
}