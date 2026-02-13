"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe } from "lucide-react"

interface ScrapeWidgetProps { data: any }

export function ScrapeWidget({ data }: ScrapeWidgetProps) {
    const content = typeof data === 'string' ? data : data?.content || data?.markdown || JSON.stringify(data, null, 2);
    const metadata = typeof data === 'object' ? data?.metadata : null;

    return (
        <Card className="w-full max-w-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/20">
            <CardHeader className="bg-muted/50 p-3 flex flex-row items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-sm font-medium">Scraped Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] w-full p-4">
                    <div className="prose dark:prose-invert text-sm max-w-none whitespace-pre-wrap">{content}</div>
                    {metadata && (
                        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                            <p className="font-semibold mb-1">Metadata:</p>
                            <pre className="overflow-auto">{JSON.stringify(metadata, null, 2)}</pre>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
